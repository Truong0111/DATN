async function showAccountManager() {
    updateNavActive("showAccountManager()");
    renderAccountContent();
    await fetchAndUpdateAccountDetail();
    await fetchAndUpdateAccountManager();
}

function renderAccountContent() {
    document.querySelector(".content").innerHTML = `
              <h2>Account</h2>
              <div class="card info-card mt-4">
                  <div class="card-body">
                      <form id="account-form">
                          <div class="row">
                              <div class="col-md-6">
                                  <div class="mb-3">
                                      <label for="name" class="form-label">Name</label>
                                      <input type="text" class="form-control" id="name" disabled>
                                  </div>
                                  <div class="mb-3">
                                      <label for="email" class="form-label">Email</label>
                                      <input type="email" class="form-control" id="email" disabled>
                                  </div>
                              </div>
                              <div class="col-md-6">
                                  <div class="mb-3">
                                      <label for="phone" class="form-label">Phone</label>
                                      <input type="tel" class="form-control" id="phone" disabled>
                                  </div>
                                  <div class="mb-3">
                                      <label for="mssv" class="form-label">MSSV</label>
                                      <input type="text" class="form-control" id="mssv" disabled>
                                  </div>
                              </div>
                              
                              <div class="col-md-6 d-none passwordDiv">
                                    <div class="mb-3">
                                        <label for="new_password" class="form-label">New Password</label>
                                        <div class="input-group">
                                            <input type="password" class="form-control" id="new_password" disabled>
                                            <button type="button" 
                                            class="btn btn-outline-secondary" 
                                            style="border-color: rgb(222,226,230)"
                                            data-target="new_password"
                                            onclick="togglePassword(this)">
                                                <i class="bi bi-eye" id="eyeIcon"></i>
                                            </button>
                                        </div>
                                    </div>
                              </div>
                          </div>
                          <button type="button" class="btn btn-primary" onclick="enableAccountFormEdit()">Edit Account</button>
                          <button type="submit" class="btn btn-success d-none" id="saveButton">Save Changes</button>
                          <button type="button" class="btn btn-dark d-none" id="cancelButton" onclick="disableAccountFormEdit()">Cancel</button>
                      </form>
                  </div>
              </div>
              
              <div class="d-flex justify-content-between align-items-center mb-4">
                  <h2>Account Manager</h2>
              </div>
              <div class="table-responsive">
                  <table class="table table-hover">
                      <thead>
                          <tr>
                              <th>ID</th>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Phone Number</th>
                              <th>RefId</th>
                              <th>Actions</th>
                          </tr>
                      </thead>
                      <tbody id="accountTableBody">
                          <tr>
                              <td colspan="6" class="text-center">Loading...</td>
                          </tr>
                      </tbody>
                  </table>
              </div>
          `;
}

function renderAccountViewModal(account) {
    const modalBody = document.querySelector("#viewAccountModal .modal-body");

    modalBody.innerHTML = `
        <div class="mb-3">
            <strong>Account ID:</strong> ${account.idAccount}
        </div>
        <div class="mb-3">
            <strong>First Name:</strong> ${account.firstName}
        </div>
        <div class="mb-3">
            <strong>Last Name:</strong> ${account.lastName}
        </div>
        <div class="mb-3">
            <strong>Email:</strong> ${account.email}
        </div>
        <div class="mb-3">
            <strong>Phone Number:</strong> ${account.phoneNumber}
        </div>
        <div class="mb-3">
            <strong>Ref ID:</strong> ${account.refId}
        </div>
    `;
}

async function fetchAndUpdateAccountDetail() {
    const token = getToken();
    const idAccount = getAccountId(token);
    try {
        const account = await fetchAccountDataRequest(idAccount);
        document.getElementById("name").value =
            account.firstName + " " + account.lastName;
        document.getElementById("email").value = account.email;
        document.getElementById("phone").value = account.phoneNumber;
        document.getElementById("mssv").value = account.refId;
    } catch (error) {
        handleError("Error fetching account data:", error);
    }
}

function enableAccountFormEdit() {
    const form = document.getElementById("account-form");
    enableAccountEditing(form);
    setupAccountFormAndSubmit(form);
}

function disableAccountFormEdit() {
    const form = document.getElementById("account-form");
    disableAccountEditing(form);
}

function enableAccountEditing(form) {
    const inputs = form.querySelectorAll("input");
    inputs.forEach((input) => (input.disabled = false));

    form.querySelector(".passwordDiv").classList.remove("d-none");
    form.querySelector("#saveButton").classList.remove("d-none");
    form.querySelector("#cancelButton").classList.remove("d-none");
}

function disableAccountEditing(form) {
    const inputs = form.querySelectorAll("input");
    inputs.forEach((input) => (input.disabled = true));

    form.querySelector(".passwordDiv").classList.add("d-none");
    form.querySelector("#saveButton").classList.add("d-none");
    form.querySelector("#cancelButton").classList.add("d-none");
}

function setupAccountFormAndSubmit(form) {
    form.onsubmit = async (e) => {
        e.preventDefault();
        const token = getToken();
        const idAccount = getAccountId(token);
        const fullName = form.querySelector("#name").value;
        const nameParts = fullName.trim().split(/\s+/);
        const lastName = nameParts.pop();
        const firstName = nameParts.join(" ");

        const accountData = {
            lastName: lastName,
            firstName: firstName,
            email: form.querySelector("#email").value,
            phoneNumber: form.querySelector("#phone").value,
            refId: form.querySelector("#mssv").value,
            password: form.querySelector("#new_password").value,
            idAccount: idAccount,
        };

        await submitForm(form, accountData)
    };
}

async function viewAccount(element){
    const idAccount = element.dataset.idAccount;
    try {
        const account = await fetchAccountDataRequest(idAccount);
        renderAccountViewModal(account);
        openModal("viewAccountModal");
    } catch (error) {
        handleError("Error viewing account:", error);
    }
}

async function editAccount(element){
    const idAccount = element.dataset.idAccount;
    try {
        const account = await fetchAccountDataRequest(idAccount);

        const idAccountEdit = document.getElementById("idAccount-edit");
        const firstNameAccountEdit = document.getElementById("firstName-edit");
        const lastNameAccountEdit = document.getElementById("lastName-edit");
        const emailAccountEdit = document.getElementById("email-edit");
        const phoneNumberAccountEdit = document.getElementById("phoneNumber-edit");
        const refIdAccountEdit = document.getElementById("refId-edit");
        const newPasswordAccountEdit = document.getElementById("newPassword-edit");

        idAccountEdit.value = account.idAccount;
        firstNameAccountEdit.value = account.firstName;
        lastNameAccountEdit.value = account.lastName;
        emailAccountEdit.value = account.email;
        phoneNumberAccountEdit.value = account.phoneNumber;
        refIdAccountEdit.value = account.refId;
        newPasswordAccountEdit.value = "";

        openModal("editAccountModal");
    } catch (error) {
        handleError("Error loading account for edit:", error);
    }
}

async function deleteAccount(element){
    const idDeletedAccount = element.dataset.idAccount;

    const ticketsRefIdAccount = await fetchTicketsRefAccount(idDeletedAccount);
    const numberTicker = ticketsRefIdAccount.length;

    const confirmText = `Are you sure you want to delete this account?\n`
        + `Has ${numberTicker} ticket${numberTicker === 1 ? "" : "s"} request of this account.\n`
        + `It will also delete those tickets!!!`;

    if (!confirm(confirmText)) return;

    try {
        const idAccountDelete = getAccountId();
        await fetchDeleteAccountRequest(idAccountDelete, idDeletedAccount);
        await showAccountManager();
    } catch (error) {
        handleError("Error deleting account:", error);
    }
}

async function submitForm(form, accountData) {
    try {
        await fetchUpdateAccountRequest(accountData);
        await fetchAndUpdateAccountManager();
        disableAccountEditing(form);
    } catch (error) {
        handleError("Error updating account:", error);
    }
}

async function saveAccountChanges(){
    const form = document.getElementById("editAccountForm");

    const accountData = {
        idAccount: form.querySelector("#idAccount-edit").value,
        firstName: form.querySelector("#firstName-edit").value,
        lastName: form.querySelector("#lastName-edit").value,
        email: form.querySelector("#email-edit").value,
        phoneNumber: form.querySelector("#phoneNumber-edit").value,
        refId: form.querySelector("#refId-edit").value,
        password: form.querySelector("#newPassword-edit").value,
    };

    try {
        await fetchUpdateAccountRequest(accountData);
        await closeModalAndRefresh("editAccountModal", showAccountManager);
    } catch (error) {
        handleError("Error updating account:", error);
    }
}

//API
async function fetchAccountDataRequest(idAccount) {
    const token = getToken();
    const api = `${ref}/account/${idAccount}`;

    const response = await getResponse(api, "GET", token, null);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
    }
    return response.json();
}

async function fetchUpdateAccountRequest(accountData) {
    const token = getToken();
    const api = `${ref}/account/${accountData.idAccount}`;
    const body = JSON.stringify(accountData);
    const response = await getResponseWithBody(api, "PATCH", token, body);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
    }
    return true;
}

async function fetchAccountsCount() {
    const token = getToken();
    const api = `${ref}/account/count`;

    const response = await getResponse(api, "GET", token, null);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
    }
    return response.json();
}

async function fetchAllAccounts() {
    const token = getToken();
    const api = `${ref}/account/getAllAccounts`;

    const response = await getResponse(api, "GET", token);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
    }
    return response.json();
}

async function fetchAccountCanAccessDoor(idDoor) {
    const token = getToken();
    const api = `${ref}/door/getAccountsCanAccessDoor/${idDoor}`;

    const response = await getResponse(api, "GET", token);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
    }
    return response.json();
}

async function fetchAndUpdateAccountManager() {
    try {
        const accounts = await fetchAllAccounts();
        const tableBody = document.getElementById("accountTableBody");
        tableBody.innerHTML = accounts
            .map((account) => `
            <tr>
                <td>${account.idAccount}</td>
                <td>${account.firstName} ${account.lastName}</td>
                <td>${account.email}</td>
                <td>${account.phoneNumber}</td>
                <td>${account.refId}</td>
                <td>
                    <button class="btn btn-sm btn-info" data-id-account="${account.idAccount}" 
                    onclick="viewAccount(this)">View</button>
                    <button class="btn btn-sm btn-warning" data-id-account="${account.idAccount}" 
                    onclick="editAccount(this)">Edit</button>
                    <button class="btn btn-sm btn-danger" data-id-account="${account.idAccount}" 
                    onclick="deleteAccount(this)">Delete</button>
                </td>
            </tr>
        `).join("");
    } catch (error) {
        handleError("Error fetching doors:", error);
    }
}

async function fetchDeleteAccountRequest(idAccountDelete, idDeletedAccount){
    const token = getToken();
    const api = `${ref}/account/${idDeletedAccount}`;

    const body = JSON.stringify({
       idAccountDelete: idAccountDelete,
    });

    const response = await getResponseWithBody(api, "DELETE", token, body);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
    }
    return true;
}