async function showTicketManager() {
    updateNavActive("showTicketManager()");
    renderTicketManagerContent();
    await fetchAndUpdateTicketManager();
}

//Render
function renderTicketManagerContent() {
    document.querySelector(".content").innerHTML = `
              <div class="d-flex justify-content-between align-items-center mb-4">
                  <h2>Ticket Manager</h2>
                  <button class="btn btn-primary" onclick="showRegisterTicketModal()">Register New Ticket</button>
              </div>
              <div class="table-responsive">
                  <table class="table table-hover">
                      <thead>
                          <tr>
                              <th>Ticket ID</th>
                              <th>Door</th>
                              <th>Status</th>
                              <th>Created At</th>
                              <th>Actions</th>
                          </tr>
                      </thead>
                      <tbody id="ticketTableBody">
                          <tr>
                              <td colspan="5" class="text-center">Loading...</td>
                          </tr>
                      </tbody>
                  </table>
              </div>
          `;
}

function renderRegisterTicketModal() {
    const modalContent = `
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Register New Ticket</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <form id="ticketForm">
                  <div class="mb-3">
                    <label for="doorSelect" class="form-label">Select Door</label>
                    <select class="form-control" id="doorSelect" required>
                      <option value="">Loading doors...</option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label for="startTime" class="form-label">Start Time</label>
                    <input type="datetime-local" class="form-control" id="startTime" required>
                  </div>
                  <div class="mb-3">
                    <label for="endTime" class="form-label">End Time</label>
                    <input type="datetime-local" class="form-control" id="endTime" required>
                  </div>
                  <div class="mb-3">
                    <label for="ticketReason" class="form-label">Reason</label>
                    <textarea class="form-control" id="ticketReason" required></textarea>
                  </div>
                </form>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" onclick="submitTicket()">Submit</button>
              </div>
            </div>
          </div>
        `;

    const modalElement = document.getElementById("registerTicketModal");
    if (!modalElement) {
        const modal = document.createElement("div");
        modal.id = "registerTicketModal";
        modal.className = "modal fade";
        modal.innerHTML = modalContent;
        document.body.appendChild(modal);
    } else {
        modalElement.innerHTML = modalContent;
    }
}

function renderTicketViewModal(ticket, door) {
    const modalBody = document.querySelector("#viewTicketModal .modal-body");

    const statusBadge = ticket.isAccept === false
        ? '<span class="badge bg-warning">Pending</span>'
        : '<span class="badge bg-success">Accepted</span>';

    modalBody.innerHTML = `
        <div class="mb-3">
            <strong>Ticket ID:</strong> ${ticket.idTicket}
        </div>
        <div class="mb-3">
            <strong>Door:</strong> ${door.position}
        </div>
        <div class="mb-3">
            <strong>Status:</strong> ${statusBadge}
        </div>
        <div class="mb-3">
            <strong>Created At:</strong> ${formatDate(ticket.createdAt)}
        </div>
        <div class="mb-3">
            <strong>Start Time:</strong> ${formatDate(ticket.startTime)}
        </div>
        <div class="mb-3">
            <strong>End Time:</strong> ${formatDate(ticket.endTime)}
        </div>
        <div class="mb-3">
            <strong>Reason:</strong> ${ticket.reason}
        </div>
    `;
}

async function fetchAndUpdateTicketManager() {
    const token = getToken();
    const idAccount = getAccountId(token);
    try {
        const tickets = await fetchTickets(idAccount);
        const tableBody = document.getElementById("ticketTableBody");

        const ticketsWithDoors = await Promise.all(
            tickets.map(async (ticket) => {
                const door = await fetchGetDoorDetailsRequest(ticket.idDoor);
                return {...ticket, door};
            })
        );

        tableBody.innerHTML = ticketsWithDoors
            .map(
                (ticket) => `
            <tr>
                <td>${ticket.idTicket}</td>
                <td>${ticket.door.position}</td>
                <td><span class="badge bg-${
                    ticket.isAccept === false ? "warning" : "success"
                }">${
                    ticket.isAccept === false ? "Pending" : "Accepted"
                }</span></td>
                <td>${formatDate(ticket.createdAt)}</td>
                <td>
                    <button class="btn btn-sm btn-info" data-id-ticket="${
                    ticket.idTicket
                }" onclick="viewTicket(this)">View</button>
                    <button class="btn btn-sm btn-danger" data-id-ticket="${
                    ticket.idTicket
                }" onclick="deleteTicket(this)">Delete</button>
                </td>
            </tr>
        `
            )
            .join("");
    } catch (error) {
        handleError("Error fetching tickets:", error);
    }
}

async function showRegisterTicketModal() {
    try {
        renderRegisterTicketModal();
        await populateDoorSelect();
        openModal("registerTicketModal");
    } catch (error) {
        handleError("Error fetching doors:", error);
    }
}

async function populateDoorSelect() {
    try {
        const doors = await fetchDoors();
        const select = document.getElementById("doorSelect");
        select.innerHTML = doors
            .map((door) => `<option value="${door.idDoor}">${door.position}</option>`)
            .join("");
    } catch (error) {
        handleError("Error fetching doors for select:", error);
    }
}

let currentTicketId = "";

async function viewTicket(element) {
    const idTicket = element.dataset.idTicket;
    currentTicketId = idTicket;
    try {
        const ticket = await fetchTicketDetailsRequest(idTicket);
        const door = await fetchGetDoorDetailsRequest(ticket.idDoor);
        renderTicketViewModal(ticket, door);
        openModal("viewTicketModal");
    } catch (error) {
        handleError("Error viewing ticket:", error);
    }
}

async function submitTicket() {
    const token = getToken();
    const ticketData = getTicketFormData(getAccountId(token));

    try {
        await fetchCreateTicketRequest(ticketData);
        await closeModalAndRefresh("registerTicketModal", showTicketManager);
    } catch (error) {
        handleError("Error creating ticket:", error);
    }
}

async function acceptTicket(){
    if (!confirm("Are you sure you want to accept this ticket?")) return;

    try {
        await fetchAcceptTicketRequest(currentTicketId);
        await closeModalAndRefresh("viewTicketModal", showTicketManager);
    } catch (error) {
        handleError("Error accepting ticket:", error);
    }
}

async function rejectTicket(){
    if (!confirm("Are you sure you want to reject this ticket?")) return;

    try {
        await fetchRejectTicketRequest(currentTicketId);
        await closeModalAndRefresh("viewTicketModal", showTicketManager);
    } catch (error) {
        handleError("Error accepting ticket:", error);
    }
}

async function deleteTicket(element) {
    const idTicket = element.dataset.idTicket;
    if (!confirm("Are you sure you want to delete this ticket?")) return;

    try {
        await fetchDeleteTicketRequest(idTicket);
        await showTicketManager();
    } catch (error) {
        handleError("Error deleting ticket:", error);
    }
}

function getTicketFormData(idAccount) {
    return {
        idAccount: idAccount,
        idDoor: document.getElementById("doorSelect").value,
        reason: document.getElementById("ticketReason").value,
        startTime: document.getElementById("startTime").value,
        endTime: document.getElementById("endTime").value,
    };
}

//API
async function fetchTickets(idAccount) {
    const token = getToken();
    const api = `${ref}/ticket/idAccount/${idAccount}`;

    const response = await getResponse(api, "GET", token);

    if (!response.ok) throw new Error("Failed to fetch tickets");
    return response.json();
}

async function fetchCreateTicketRequest(ticketData) {
    const token = getToken();
    const api = `${ref}/ticket/create`;
    const response = await fetch(api, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(ticketData),
    });

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData);
    }
    return true;
}

async function fetchTicketDetailsRequest(idTicket) {
    const token = getToken();
    const api = `${ref}/ticket/${idTicket}`;
    const response = await fetch(api, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error("Failed to fetch ticket details");
    return response.json();
}

async function fetchAcceptTicketRequest(idTicket) {
    const token = getToken();
    const api = `${ref}/ticket/${idTicket}`;
    const body = JSON.stringify({
        isAccept: true,
    });
    const response = await getResponseWithBody(api, "PATCH", token, body);

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData);
    }
    return true;
}

async function fetchRejectTicketRequest(idTicket) {
    const token = getToken();
    const api = `${ref}/ticket/${idTicket}`;
    const body = JSON.stringify({
        isAccept: false,
    });
    const response = await getResponseWithBody(api, "PATCH", token, body);

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData);
    }
    return true;
}

async function fetchDeleteTicketRequest(idTicket) {
    const token = getToken();
    const api = `${ref}/ticket/${idTicket}`;

    const response = await getResponse(api, "DELETE", token);

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData);
    }
    return true;
}