async function showAccountManager() {
    updateNavActive("showAccountManager()");
    renderAccountContent();
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
          `;
}

async function fetchAndUpdateAccountManager() {
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

async function submitForm(form, accountData) {
    try {
        await fetchUpdateAccountRequest(accountData);
        await fetchAndUpdateAccountManager();
        disableAccountEditing(form);
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