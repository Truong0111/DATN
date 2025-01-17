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
<!--                  <button class="btn btn-primary" onclick="showCreateDoorModal()">Add New Door</button>-->
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
            <strong>Mac Address:</strong> ${door.macAddress}
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

function renderDoorAddAccountAccess(accounts) {
    const modalBody = document.querySelector("#addAccountAccessDoorModal .modal-body");
    const originalAccounts = [...accounts];

    modalBody.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>ID <input type="text" class="form-control form-control-sm mt-1" placeholder="Search ID" id="searchId"></th>
                    <th>Full Name <input type="text" class="form-control form-control-sm mt-1" placeholder="Search name" id="searchName"></th>
                    <th>Reference ID <input type="text" class="form-control form-control-sm mt-1" placeholder="Search ref ID" id="searchRef"></th>
                    <th>Select</th>
                </tr>
            </thead>
            <tbody id="accountsTableBody">
                ${accounts.map((account) => `
                <tr>
                    <td>${account.idAccount}</td>
                    <td>${account.firstName} ${account.lastName}</td>
                    <td>${account.refId}</td>
                    <td><input type="checkbox" class="account-select" value="${account.idAccount}"></td>
                </tr>
                `).join("")}
            </tbody>
        </table>
    `;

    const searchId = document.getElementById('searchId');
    const searchName = document.getElementById('searchName');
    const searchRef = document.getElementById('searchRef');
    const tableBody = document.getElementById('accountsTableBody');

    function filterAccounts() {
        const idFilter = searchId.value.toLowerCase();
        const nameFilter = searchName.value.toLowerCase();
        const refFilter = searchRef.value.toLowerCase();

        const filteredAccounts = originalAccounts.filter(account => {
            const fullName = `${account.firstName} ${account.lastName}`.toLowerCase();
            const idMatch = account.idAccount.toString().toLowerCase().includes(idFilter);
            const nameMatch = fullName.includes(nameFilter);
            const refMatch = account.refId.toString().toLowerCase().includes(refFilter);

            return idMatch && nameMatch && refMatch;
        });

        tableBody.innerHTML = filteredAccounts.map((account) => `
            <tr>
                <td>${account.idAccount}</td>
                <td>${account.firstName} ${account.lastName}</td>
                <td>${account.refId}</td>
                <td><input type="checkbox" class="account-select" value="${account.idAccount}"></td>
            </tr>
        `).join("");
    }

    searchId.addEventListener('input', filterAccounts);
    searchName.addEventListener('input', filterAccounts);
    searchRef.addEventListener('input', filterAccounts);
}

function renderDoorRemoveAccountAccess(accounts) {
    const modalBody = document.querySelector("#removeAccountAccessDoorModal .modal-body");
    const originalAccounts = [...accounts]; // Keep original data for filtering

    modalBody.innerHTML = `
       <table class="table">
           <thead>
               <tr>
                   <th>ID <input type="text" class="form-control form-control-sm mt-1" placeholder="Search ID" id="searchRemoveId"></th>
                   <th>Full Name <input type="text" class="form-control form-control-sm mt-1" placeholder="Search name" id="searchRemoveName"></th> 
                   <th>Reference ID <input type="text" class="form-control form-control-sm mt-1" placeholder="Search ref ID" id="searchRemoveRef"></th>
                   <th>Select</th>
               </tr>
           </thead>
           <tbody id="removeAccountsTableBody">
               ${accounts.map((account) => `
               <tr>
                   <td>${account.idAccount}</td>
                   <td>${account.firstName} ${account.lastName}</td>
                   <td>${account.refId}</td>
                   <td><input type="checkbox" class="account-select" value="${account.idAccount}"></td>
               </tr>
               `).join("")}
           </tbody>
       </table>
   `;

    const searchId = document.getElementById('searchRemoveId');
    const searchName = document.getElementById('searchRemoveName');
    const searchRef = document.getElementById('searchRemoveRef');
    const tableBody = document.getElementById('removeAccountsTableBody');

    function filterRemoveAccounts() {
        const idFilter = searchId.value.toLowerCase();
        const nameFilter = searchName.value.toLowerCase();
        const refFilter = searchRef.value.toLowerCase();

        const filteredAccounts = originalAccounts.filter(account => {
            const fullName = `${account.firstName} ${account.lastName}`.toLowerCase();
            const idMatch = account.idAccount.toString().toLowerCase().includes(idFilter);
            const nameMatch = fullName.includes(nameFilter);
            const refMatch = account.refId.toString().toLowerCase().includes(refFilter);

            return idMatch && nameMatch && refMatch;
        });

        tableBody.innerHTML = filteredAccounts.map((account) => `
           <tr>
               <td>${account.idAccount}</td>
               <td>${account.firstName} ${account.lastName}</td>
               <td>${account.refId}</td>
               <td><input type="checkbox" class="account-select" value="${account.idAccount}"></td>
           </tr>
       `).join("");
    }

    searchId.addEventListener('input', filterRemoveAccounts);
    searchName.addEventListener('input', filterRemoveAccounts);
    searchRef.addEventListener('input', filterRemoveAccounts);
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
                    <button class="btn btn-sm btn-success" data-id-door="${door.idDoor}"
                    onclick="addAccountAccess(this)">Add</button>
                    <button class="btn btn-sm btn-warning" data-id-door="${door.idDoor}"
                    onclick="removeAccountAccess(this)">Remove</button>
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
    const idAccount = getAccountId();
    const position = document.getElementById("newDoorPosition").value;

    try {
        await fetchCreateDoorRequest(idAccount, position);
        await closeModalAndRefresh("createDoorModal", showDoorManager);
    } catch (error) {
        handleError("Error creating door:\n", error);
    }
}

async function addAccountAccess(element) {
    const idDoor = element.dataset.idDoor;
    try {
        document.getElementById("idDoor-addAccount").value = idDoor;
        const accounts = await fetchAllAccounts();
        renderDoorAddAccountAccess(accounts);
        openModal("addAccountAccessDoorModal");
    } catch (error) {
        handleError("Error adding account access:", error);
    }
}

async function removeAccountAccess(element) {
    const idDoor = element.dataset.idDoor;
    try {
        document.getElementById("idDoor-removeAccount").value = idDoor;
        const accounts = await fetchAccountCanAccessDoor(idDoor);
        renderDoorRemoveAccountAccess(accounts);
        openModal("removeAccountAccessDoorModal");
    } catch (error) {
        handleError("Error removing account access:", error);
    }
}

async function saveAddAccountAccess() {
    try {
        const selectedAccounts = document.querySelectorAll('#addAccountAccessDoorBody input[type="checkbox"]:checked');

        if (selectedAccounts.length === 0) {
            alert('Please select at least one account');
            return;
        }

        const idDoor = document.getElementById("idDoor-addAccount").value;
        const accountIds = Array.from(selectedAccounts).map(checkbox => checkbox.value);

        const token = getToken();
        const api = `${ref}/door/addAccountAccessDoor`;

        const body = JSON.stringify({
            idDoor: idDoor,
            accounts: accountIds,
        });

        const response = await getResponseWithBody(api, "POST", token, body);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }

        alert('Account access added successfully');
        await closeModalAndRefresh("addAccountAccessDoorModal", showDoorManager);
    } catch (error) {
        console.error('Error saving account access:', error);
        alert('Failed to add account access door. Please try again.');
    }
}

async function saveRemoveAccountAccess() {
    try {
        const selectedAccounts = document.querySelectorAll('#removeAccountAccessDoorBody input[type="checkbox"]:checked');

        if (selectedAccounts.length === 0) {
            alert('Please select at least one account');
            return;
        }

        const idDoor = document.getElementById("idDoor-removeAccount").value;
        const accountIds = Array.from(selectedAccounts).map(checkbox => checkbox.value);

        const token = getToken();
        const api = `${ref}/door/removeAccountAccessDoor`;

        const body = JSON.stringify({
            idDoor: idDoor,
            accounts: accountIds,
        });

        const response = await getResponseWithBody(api, "POST", token, body);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }

        alert('Account access removed successfully');
        await closeModalAndRefresh("removeAccountAccessDoorModal", showDoorManager);
    } catch (error) {
        console.error('Error saving account access:', error);
        alert('Failed to remove account access door. Please try again.');
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
        const positionDoorEdit = document.getElementById("positionDoor-edit");
        const macDoorEdit = document.getElementById("macDoor-edit");
        const statusDoorEdit = document.getElementById("statusDoor-edit");
        const labelStatus = document.getElementById("status-label");

        idDoorEdit.value = door.idDoor;
        positionDoorEdit.value = door.position;
        macDoorEdit.value = door.macAddress;
        statusDoorEdit.checked = door.status;
        labelStatus.innerHTML = door.status ? `Open` : `Close`;

        statusDoorEdit.addEventListener("change", function (e) {
            if (e.target.checked) {
                labelStatus.innerHTML = "Open";
            } else {
                labelStatus.innerHTML = "Close";
            }
        });

        openModal("editDoorModal");
    } catch (error) {
        handleError("Error loading door for edit:", error);
    }
}

async function saveDoorChanges() {
    const idDoor = document.getElementById("idDoor-edit").value;
    const position = document.getElementById("positionDoor-edit").value;
    const status = document.getElementById("statusDoor-edit");

    const token = getToken();
    const idAccount = getAccountId(token);

    try {
        await fetchUpdateDoorRequest(idDoor, position, idAccount, status.checked);
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
    const api = `${ref}/door/getAll`;
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
        const errorData = await response.json();
        throw new Error(errorData.message);
    }

    return response.json();
}

async function fetchGetDoorDetailsRequest(idDoor) {
    const token = getToken();
    const api = `${ref}/door/${idDoor}`;

    const response = await getResponse(api, "GET", token);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
    }
    return response.json();
}

async function fetchUpdateDoorRequest(idDoor, position, idAccount, status) {
    const token = getToken();
    const api = `${ref}/door/${idDoor}`;
    const body = JSON.stringify({
        idAccountCreate: idAccount,
        position: position,
        status: status
    });
    const response = await getResponseWithBody(api, "PATCH", token, body);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
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
        const errorData = await response.json();
        throw new Error(errorData.message);
    }
    return true;
}

