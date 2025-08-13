document.addEventListener("DOMContentLoaded", function () {
    firebase.auth().onAuthStateChanged(async function (user) {
        if (!user) {
            window.location.href = 'SignIn.html'; // مصححة من SingIn.html
            return;
        }

        // Load user data
        const doc = await firebase.firestore().collection('users').doc(user.uid).get();
        if (doc.exists) {
            const userData = doc.data();
            document.getElementById('first-name').textContent = userData.firstName;
            document.getElementById('last-name').textContent = userData.lastName;
            document.getElementById('username').textContent = userData.username;
            document.getElementById('email').textContent = userData.email;
            document.getElementById('phone').textContent = userData.phone;

            loadMembers(user.uid);
        }

        setupEditAndSave(user.uid); // فصلنا كود التعديل في دالة مستقلة للترتيب
    });
});

function setupEditAndSave(userId) {
    const editBtn = document.getElementById("edit-btn");
    const saveBtn = document.getElementById("save-btn");
    const fields = ["first-name", "last-name", "username", "phone"];

    editBtn.addEventListener("click", function () {
        fields.forEach(field => {
            const span = document.getElementById(field);
            const input = document.createElement("input");
            input.type = "text";
            input.value = span.textContent;
            input.id = "edit-" + field;
            span.replaceWith(input);
        });
        editBtn.style.display = "none";
        saveBtn.style.display = "block";
    });

    saveBtn.addEventListener("click", async function () {
        const updates = {};
        fields.forEach(field => {
            const input = document.getElementById("edit-" + field);
            const span = document.createElement("span");
            span.id = field;
            span.textContent = input.value;
            updates[field] = input.value;
            input.replaceWith(span);
        });

        try {
            await firebase.firestore().collection('users').doc(userId).update(updates);
            alert("Information updated successfully!");
        } catch (error) {
            alert("Error updating information: " + error.message);
        }

        editBtn.style.display = "block";
        saveBtn.style.display = "none";
    });
}


async function loadMembers(userId) {
    const membersList = document.getElementById('membersList');
    membersList.innerHTML = '';
    
    const snapshot = await firebase.firestore()
        .collection('users').doc(userId)
        .collection('members').get();
        
    snapshot.forEach(doc => {
        const member = doc.data();
        const memberDiv = document.createElement('div');
        memberDiv.className = 'box';
        memberDiv.innerHTML = `<p><strong>${member.fullName}</strong> - ${member.relationship}</p>`;
        membersList.appendChild(memberDiv);
    });
}