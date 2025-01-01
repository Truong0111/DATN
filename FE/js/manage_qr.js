async function showQRCodeManger() {
    updateNavActive("showQRCodeManger()");
    renderQrCodeManagerContent();
    await fetchAndUpdateQrCodeManager();
}

// Render
function renderQrCodeManagerContent() {
    document.querySelector(".content").innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>QR Code Manager</h2>
        </div>
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>ID Door</th>
                        <th>UUID</th>
                        <th>Next Change</th>
                        <th>Actions</th>                      
                    </tr>
                </thead>
                <tbody id="qrCodeBody">
                    <tr>
                        <td colspan="3" class="text-center">Loading...</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

function renderQrCodeModal() {
    const modalBody = document.querySelector("#viewQrCodeModal .modal-body");
    modalBody.innerHTML = `
        <div class="d-flex justify-content-center align-items-center">
            <canvas id="qrCodeCanvas"></canvas>
        </div>
    `;
}

// Function
async function openDoor(element) {
    const idDoor = element.dataset.idDoor;
    try {
        await fetchOpenDoorRequest(idDoor);
    } catch (error) {
        handleError(`Failed to open door ${idDoor}`)
    }
}

async function viewQR(element) {
    const idDoor = element.dataset.idDoor;
    try {
        const token = await fetchTokenDetailsRequest(idDoor);

        if (token.message) {
            alert(token.message);
        } else {
            renderQrCodeModal();
            openModal("viewQrCodeModal");

            generateQR(`${idDoor}::${token.value}`);
        }
    } catch (error) {
        handleError("Failed to view QR code. Please try again later.");
    }
}

function generateQR(token) {
    const text = token.toString();
    if (text) {
        QRCode.toCanvas(document.getElementById("qrCodeCanvas"), text, function (error) {
            if (error) {
                handleError("Failed to generate QR code.");
            } else {
                console.log("QR Code generated successfully");
            }
        });
    } else {
        handleError("Invalid QR code data received.");
    }
}


async function fetchAndUpdateQrCodeManager() {
    try {
        const tokenDatas = await fetchAllTokens();

        const result = [];

        Object.keys(tokenDatas).forEach((key) => {
            const token = tokenDatas[key];
            result.push({
                idDoor: key,
                uuid: token?.value,
                timeStamp: token?.timeStamp,
            });
        });

        const tableBody = document.querySelector("#qrCodeBody");
        if (result.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center">No QR codes found</td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = result
            .map((qr) => `
            <tr>
                <td>${escapeHtml(qr.idDoor)}</td>
                <td>${escapeHtml(qr.uuid)}</td>
                <td>${convertTimestampToDate(qr.timeStamp)}</td>
                <td>
                    <button class="btn btn-sm btn-success" data-id-door="${escapeHtml(qr.idDoor)}"
                    onclick="openDoor(this)">Open</button>
                    <button class="btn btn-sm btn-info" data-id-door="${escapeHtml(qr.idDoor)}"
                    onclick="viewQR(this)">View QR</button>
                </td>
            </tr>
        `).join("");
    } catch (error) {
        handleError("Error fetching QR: ", error);
    }
}

// API
async function fetchAllTokens() {
    const token = getToken();
    const api = `${ref}/token/getAll`;

    try {
        const response = await getResponse(api, "GET", token);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch tokens');
        }
        return response.json();
    } catch (error) {
        throw new Error(`Failed to fetch tokens: ${error.message}`);
    }
}

async function fetchTokenDetailsRequest(idDoor) {
    const token = getToken();
    const api = `${ref}/token/idDoor/${idDoor}`;

    try {
        const response = await getResponse(api, "GET", token);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch token details');
        }
        return response.json();
    } catch (error) {
        throw new Error(`Failed to fetch token details: ${error.message}`);
    }
}

async function fetchOpenDoorRequest(idDoor) {
    const token = getToken();
    const api = `${ref}/door/open`;

    const body = JSON.stringify({
        idDoor: idDoor,
        idAccount: getAccountId()
    })

    try {
        const response = await getResponseWithBody(api, "POST", token, body);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to open door');
        }
        return response.json();
    } catch (error) {
        handleError(`Error when request open door: ${error.message}`);
    }
}