async function showDashboard() {
    updateNavActive("showDashboard()");
    renderDashboardContent();
    await fetchAndUpdateDashboardManger();
}

function logout() {
    openModal("logoutModal");
}

function confirmLogout() {
    removeToken();
    window.location.href = "login.html";
}

async function fetchAndUpdateDashboardManger() {
    const token = getToken();
    const idAccount = getAccountId(token);

    try {
        const [account, doors, tickets] = await Promise.all([
            fetchAccountDataRequest(token, idAccount),
            fetchDoors(token),
            fetchTickets(token, idAccount),
        ]);

        // Update account info
        document.getElementById("accountName").textContent =
            account.firstName + " " + account.lastName;
        document.getElementById("accountEmail").textContent = account.email;
        document.getElementById("accountPhone").textContent = account.phoneNumber;
        document.getElementById("accountMSSV").textContent = account.refId;

        // Update statistics
        document.getElementById("doorCount").textContent = doors.length;
        document.getElementById("pendingTickets").textContent = tickets.filter(
            (t) => t.isAccept === false
        ).length;
        document.getElementById("acceptedTickets").textContent = tickets.filter(
            (t) => t.isAccept === true
        ).length;
    } catch (error) {
        handleError("Error fetching dashboard data:", error);
    }
}

function renderDashboardContent() {
    document.querySelector(".content").innerHTML = `
              <h2>Welcome to QR Code Door Access System</h2>
              <div class="card info-card mt-4">
                  <div class="card-body">
                      <h5 class="card-title">Account Information</h5>
                      <div class="row">
                          <div class="col-md-6">
                              <p><strong>Name:</strong> <span id="accountName">Loading...</span></p>
                              <p><strong>Email:</strong> <span id="accountEmail">Loading...</span></p>
                          </div>
                          <div class="col-md-6">
                              <p><strong>Phone:</strong> <span id="accountPhone">Loading...</span></p>
                              <p><strong>MSSV:</strong> <span id="accountMSSV">Loading...</span></p>
                          </div>
                      </div>
                  </div>
              </div>
              <div class="row mt-4">
                  <div class="col-md-6">
                      <div class="card dashboard-card">
                          <div class="card-body text-center">
                              <h5 class="card-title">Door Access</h5>
                              <div class="stat-number" id="doorCount">0</div>
                              <p class="card-text">Total Accessible Doors</p>
                          </div>
                      </div>
                  </div>
                  <div class="col-md-6">
                      <div class="card dashboard-card">
                          <div class="card-body text-center">
                              <h5 class="card-title">Ticket Status</h5>
                              <div class="d-flex justify-content-around">
                                  <div>
                                      <div class="stat-number text-warning" id="pendingTickets">0</div>
                                      <p class="card-text">Pending</p>
                                  </div>
                                  <div>
                                      <div class="stat-number text-success" id="acceptedTickets">0</div>
                                      <p class="card-text">Accepted</p>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          `;
}

document.addEventListener("DOMContentLoaded", async () => {
    const token = getToken();
    if (!token) {
        window.location.href = "login.html";
    } else {
        await showDashboard();
    }
});
