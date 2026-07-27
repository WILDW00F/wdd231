document.addEventListener("DOMContentLoaded", () => {

    const params = new URLSearchParams(window.location.search);

    const firstName = params.get("firstname");
    const lastName = params.get("lastname");
    const email = params.get("email");
    const phone = params.get("phone");
    const organization = params.get("organization");
    const timestamp = params.get("timestamp");

    const results = document.getElementById("results");

    results.innerHTML = `
        <h2>Application Details</h2>

        <p><strong>First Name:</strong> ${firstName}</p>

        <p><strong>Last Name:</strong> ${lastName}</p>

        <p><strong>Email:</strong> ${email}</p>

        <p><strong>Mobile Phone:</strong> ${phone}</p>

        <p><strong>Business / Organization:</strong> ${organization}</p>

        <p><strong>Application Submitted:</strong> ${new Date(timestamp).toLocaleString()}</p>
    `;

});