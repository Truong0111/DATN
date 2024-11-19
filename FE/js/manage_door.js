async function showDoorManager() {
    updateNavActive("showDoorManager()");
    renderDoorManagerContent();
    await fetchAndUpdateDoorManager();
}

//Render
function renderDoorManagerContent() {
    document.querySelector(".content").innerHTML = `
              <div class="d-flex justify-content-between align-items-center mb-4">
                  <h2>Door Manager</h2>
                  <button class="btn btn-primary" onclick="showCreateDoorModal()">Add New Door</button>
              </div>
              <div class="table-responsive">
                  <table class="table table-hover">
                      <thead>
                          <tr>
                              <th>Position</th>
                              <th>Created Date</th>
                              <th>Last Update</th>
                              <th>Actions</th>
                          </tr>
                      </thead>
                      <tbody id="doorTableBody">
                          <tr>
                              <td colspan="4" class="text-center">Loading...</td>
                          </tr>
                      </tbody>
                  </table>
              </div>
          `;
}

function renderDoorViewModal(door) {
    const modalBody = document.querySelector("#viewDoorModal .modal-body");

    modalBody.innerHTML = `
        <div class="mb-3">
            <strong>Door ID:</strong> ${door.idDoor}
        </div>
        <div class="mb-3">
            <strong>Position:</strong> ${door.position}
        </div>
        <div class="mb-3">
            <strong>Created Date:</strong> ${formatDate(door.createdAt)}
        </div>
        <div class="mb-3">
            <strong>Last Update:</strong> ${formatDate(door.lastUpdate)}
        </div>
    `;
}

function populateEditDoorForm(door) {
    document.getElementById("idDoor-edit").value = door.idDoor;
    document.getElementById("doorPosition").value = door.position;
}

// Function
async function fetchAndUpdateDoorManager() {
    try {
        const doors = await fetchDoors();
        const tableBody = document.getElementById("doorTableBody");
        tableBody.innerHTML = doors
            .map((door) => `
            <tr>
                <td>${door.position}</td>
                <td>${formatDate(door.createdAt)}</td>
                <td>${formatDate(door.lastUpdate)}</td>
                <td>
                    <button class="btn btn-sm btn-info" data-id-door="${door.idDoor}" 
                    onclick="viewDoor(this)">View</button>
                    <button class="btn btn-sm btn-warning" data-id-door="${door.idDoor}" 
                    onclick="editDoor(this)">Edit</button>
                    <button class="btn btn-sm btn-danger" data-id-door="${door.idDoor}" 
                    onclick="deleteDoor(this)">Delete</button>
                </td>
            </tr>
        `).join("");
    } catch (error) {
        handleError("Error fetching doors:", error);
    }
}

function showCreateDoorModal() {
    openModal("createDoorModal");
}

async function createNewDoor() {
    const token = getToken();
    const idAccount = getAccountId();
    const position = document.getElementById("newDoorPosition").value;

    try {
        await fetchCreateDoorRequest(idAccount, position);
        await closeModalAndRefresh("createDoorModal", showDoorManager);
    } catch (error) {
        handleError("Error creating door:", error);
    }
}

async function viewDoor(element) {
    const idDoor = element.dataset.idDoor;
    try {
        const door = await fetchGetDoorDetailsRequest(idDoor);
        renderDoorViewModal(door);
        openModal("viewDoorModal");
    } catch (error) {
        handleError("Error viewing door:", error);
    }
}

async function editDoor(element) {
    const idDoor = element.dataset.idDoor;
    try {
        const door = await fetchGetDoorDetailsRequest(idDoor);

        const idDoorEdit = document.getElementById("idDoor-edit");
        const doorPosition = document.getElementById("doorPosition");

        idDoorEdit.value = door.idDoor;
        doorPosition.value = door.position;

        openModal("editDoorModal");
    } catch (error) {
        handleError("Error loading door for edit:", error);
    }
}

async function saveDoorChanges() {
    const idDoor = document.getElementById("idDoor-edit").value;
    const position = document.getElementById("doorPosition").value;
    const token = getToken();
    const idAccount = getAccountId(token);

    try {
        await fetchUpdateDoorRequest(idDoor, position, idAccount);
        await closeModalAndRefresh("editDoorModal", showDoorManager);
    } catch (error) {
        handleError("Error updating door:", error);
    }
}

async function deleteDoor(element) {
    const idDoor = element.dataset.idDoor;
    const ticketsRefIdDoor = await fetchTicketsRefDoor(idDoor);
    const numberTicker = ticketsRefIdDoor.length;
    const confirmText = `Are you sure you want to delete this door?\n`
        + `Has ${numberTicker} ticket${numberTicker === 1 ? "" : "s"} request for this door.\n`
        + `It will also delete those tickets!!!`;

    if (!confirm(confirmText)) return;

    try {
        const token = getToken();
        const idAccount = getAccountId(token);
        await fetchDeleteDoorRequest(idDoor, idAccount);
        await showDoorManager();
    } catch (error) {
        handleError("Error deleting door:", error);
    }
}

//API
async function fetchDoors() {
    const token = getToken();
    const api = `${ref}/door/getAllDoors`;
    const response = await getResponse(api, "GET", token);

    if (!response.ok) throw new Error("Failed to fetch doors");

    return response.json();
}

async function fetchDoorById(idDoor) {
    const api = `${ref}/doors/${idDoor}`;
    const token = getToken();

    const response = await getResponse(api, "GET", token);

    return response.json();
}

async function fetchCreateDoorRequest(idAccount, position) {
    const token = getToken();
    const api = `${ref}/door/create`;

    const body = JSON.stringify({
        idAccountCreate: idAccount,
        position: position,
    });

    const response = await getResponseWithBody(api, "POST", token, body);

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData);
    }
    return true;
}

async function fetchGetDoorDetailsRequest(idDoor) {
    const token = getToken();
    const api = `${ref}/door/${idDoor}`;

    const response = await getResponse(api, "GET", token);

    if (!response.ok) throw new Error("Failed to fetch door details");
    return response.json();
}

async function fetchUpdateDoorRequest(idDoor, position, idAccount) {
    const token = getToken();
    const api = `${ref}/door/${idDoor}`;
    const body = JSON.stringify({
        idAccountCreate: idAccount,
        position: position,
    });
    const response = await getResponseWithBody(api, "PATCH", token, body);

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData);
    }
    return true;
}

async function fetchDeleteDoorRequest(idDoor, idAccount) {
    const token = getToken();
    const api = `${ref}/door/${idDoor}`;

    const body = JSON.stringify({
        idAccountDelete: idAccount,
    });

    const response = await getResponseWithBody(api, "DELETE", token, body);

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData);
    }
    return true;
}

async function fetchTicketsRefDoor(idDoor) {
    const token = getToken();
    const api = `${ref}/ticket/idDoor/${idDoor}`;
    const response = await getResponse(api, "GET", token);
    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData);
    }
    return response.json();
}

