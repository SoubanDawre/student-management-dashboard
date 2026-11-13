
const studentForm = document.getElementById("studentForm");
const studentList = document.getElementById("studentList");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const cancelEditButton = document.getElementById("cancelEdit");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageInfo = document.getElementById("pageInfo");

let currentPage = 1;
const studentsPerPage = 5;

let students = JSON.parse(localStorage.getItem("students")) || [];
let editingEmail = null;


// Updates the total student count
function updateStudentCount() {
    const count = students.length;

    document.getElementById("studentCount").textContent =
        "Total Students: " + count;
}


// Cancel Edit functionality
cancelEditButton.addEventListener("click", function() {
    studentForm.reset();
    editingEmail = null;
});


// Renders students in the HTML
function renderStudents(studentArray = students) {

    studentList.innerHTML = "";

    // Calculate total pages
    const totalPages = Math.max(
        1,
        Math.ceil(studentArray.length / studentsPerPage)
    );

    // Make sure current page is valid
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    // Calculate pagination indexes
    const start = (currentPage - 1) * studentsPerPage;
    const end = start + studentsPerPage;

    // Get students for current page
    const paginatedStudents = studentArray.slice(start, end);


    // Display students
    paginatedStudents.forEach(function(student) {

        const listItem = document.createElement("li");

        const studentDetails = document.createElement("span");

        studentDetails.textContent =
            student.name + " | " +
            student.email + " | " +
            student.course;


        // Delete button
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";
        deleteButton.type = "button";

        deleteButton.addEventListener("click", function() {

            const index = students.findIndex(function(s) {
                return s.email === student.email;
            });

            if (index !== -1) {
                students.splice(index, 1);
            }

            if (editingEmail === student.email) {
                editingEmail = null;
                studentForm.reset();
            }

            localStorage.setItem("students", JSON.stringify(students));

            updateDisplayedStudents();
        });


        // Edit button
        const editButton = document.createElement("button");

        editButton.textContent = "Edit";
        editButton.type = "button";

        editButton.addEventListener("click", function() {

            document.getElementById("name").value = student.name;
            document.getElementById("email").value = student.email;
            document.getElementById("course").value = student.course;

            editingEmail = student.email;
        });


        listItem.appendChild(studentDetails);
        listItem.appendChild(deleteButton);
        listItem.appendChild(editButton);

        studentList.appendChild(listItem);
    });


    // Display message if no students match
    if (studentArray.length === 0) {

        const message = document.createElement("li");

        message.textContent = "No students found.";

        studentList.appendChild(message);
    }


    // Update pagination information
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;

    updateStudentCount();
}


// Search and sorting functionality
function updateDisplayedStudents() {

    const searchText = searchInput.value.toLowerCase();

    // Filter students
    let filteredStudents = students.filter(function(student) {

        return student.name.toLowerCase().includes(searchText) ||
               student.email.toLowerCase().includes(searchText) ||
               student.course.toLowerCase().includes(searchText);

    });


    // Sort students
    const sortValue = sortSelect.value;

    if (sortValue === "name") {

        filteredStudents.sort(function(a, b) {
            return a.name.localeCompare(b.name);
        });

    } else if (sortValue === "course") {

        filteredStudents.sort(function(a, b) {
            return a.course.localeCompare(b.course);
        });

    }


    // Reset to first page when search or sorting results change
    currentPage = 1;

    renderStudents(filteredStudents);
}


// Previous button
prevBtn.addEventListener("click", function() {

    if (currentPage > 1) {
        currentPage--;
        updateDisplayedStudents();
    }

});


// Next button
nextBtn.addEventListener("click", function() {

    const searchText = searchInput.value.toLowerCase();

    const filteredStudents = students.filter(function(student) {

        return student.name.toLowerCase().includes(searchText) ||
               student.email.toLowerCase().includes(searchText) ||
               student.course.toLowerCase().includes(searchText);

    });

    const totalPages = Math.ceil(
        filteredStudents.length / studentsPerPage
    );

    if (currentPage < totalPages) {
        currentPage++;

        // Reapply sorting and render
        const sortValue = sortSelect.value;

        if (sortValue === "name") {
            filteredStudents.sort(function(a, b) {
                return a.name.localeCompare(b.name);
            });
        } else if (sortValue === "course") {
            filteredStudents.sort(function(a, b) {
                return a.course.localeCompare(b.course);
            });
        }

        renderStudents(filteredStudents);
    }

});


// Search event
searchInput.addEventListener("input", updateDisplayedStudents);


// Sorting event
sortSelect.addEventListener("change", updateDisplayedStudents);


// Add and Update student functionality
studentForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const course = document.getElementById("course").value.trim();


    // Check empty fields
    if (name === "" || email === "" || course === "") {

        alert("Please fill in all the fields");
        return;
    }


    // Check email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {

        alert("Please enter a valid email address.");
        return;
    }


    // Check duplicate emails
    const emailExists = students.some(function(student) {

        return student.email.toLowerCase() === email.toLowerCase() &&
               student.email.toLowerCase() !==
               (editingEmail || "").toLowerCase();

    });

    if (emailExists) {

        alert("A student with this email already exists.");
        return;
    }


    // Update existing student
    if (editingEmail !== null) {

        const index = students.findIndex(function(student) {
            return student.email === editingEmail;
        });

        if (index !== -1) {

            students[index] = {
                name: name,
                email: email,
                course: course
            };

        }

        editingEmail = null;

    } else {

        // Add new student
        students.push({
            name: name,
            email: email,
            course: course
        });

    }


    // Save students to localStorage
    localStorage.setItem("students", JSON.stringify(students));

    studentForm.reset();

    // Refresh search, sorting and pagination
    updateDisplayedStudents();

});


// Display students when page loads
updateDisplayedStudents();
