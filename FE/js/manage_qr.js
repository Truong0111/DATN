async function showQRCodeManger() {
    updateNavActive("showQRCodeManger()");
    renderQrCodeManagerContent();
    await fetchAndUpdateQrCodeManager();
}

//Render
function renderQrCodeManagerContent() {
    document.querySelector(".content").innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>QR Code Manager</h2>
        </div>
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Door Position</th>
                        <th>End Time</th>
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

//Function
async function viewQR(element) {
    const idToken = element.dataset.idToken;
    try {
        const token = await fetchTokenDetailsRequest(idToken);
        renderQrCodeModal();
        openModal("viewQrCodeModal");
        generateQR(token);
    } catch (error) {
        handleError("Error viewing qr: ", error);
    }
}

function generateQR(token) {
    const text = token.value.toString();
    if (text) {
        QRCode.toCanvas(document.getElementById("qrCodeCanvas"), text, function (error) {
            if (error) {
                console.error(error);
            } else {
                console.log("QR Code generated");
            }
        });
    } else {
        console.error("Value invalid");
    }
}


async function fetchAndUpdateQrCodeManager() {
    try {
        const tokenDatas = await fetchQrCodes();
        const result = [];

        tokenDatas.forEach((token) => {
            const value = token.tokenData.value;
            const [doorPosition, refId, endTime] = value.split('_');
            result.push({
                idToken: token.idToken,
                doorPosition: doorPosition,
                refId: refId,
                endTime: endTime,
            });
        });

        const tableBody = document.querySelector("#qrCodeBody");
        tableBody.innerHTML = result
            .map((qr) => `
            <tr>
                <td>${qr.doorPosition}</td>
                <td>${formatDate(qr.endTime)}</td>
                <td>
                    <button class="btn btn-sm btn-info" data-id-token="${qr.idToken}"
                    onclick="viewQR(this)"> View QR</button>
                </td>
            </tr>
        `).join("");
    } catch (error) {
        handleError("Error fetching QR: ", error);
    }
}

//API
async function fetchQrCodes() {
    const token = getToken();
    const idAccount = getAccountId();

    const api = `${ref}/token/getTokenByUserId/${idAccount}`;

    const response = await getResponse(api, "GET", token);

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData);
    }
    return response.json();
}

async function fetchTokenDetailsRequest(idToken) {
    const token = getToken();
    const api = `${ref}/token/${idToken}`;

    const response = await getResponse(api, "GET", token);

    if (!response.ok) throw new Error("Failed to fetch token details");
    return response.json();
}