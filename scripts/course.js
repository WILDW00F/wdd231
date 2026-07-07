const courses = [

    {
        subject: "WDD",
        number: 130,
        credits: 3,
        completed: true
    },

    {
        subject: "WDD",
        number: 131,
        credits: 3,
        completed: true
    },

    {
        subject: "WDD",
        number: 231,
        credits: 3,
        completed: false
    },

    {
        subject: "CSE",
        number: 110,
        credits: 2,
        completed: true
    },

    {
        subject: "CSE",
        number: 111,
        credits: 2,
        completed: false
    }

];

const container = document.querySelector("#course-container");

function displayCourses(courseList) {

    container.innerHTML = "";

    courseList.forEach(course => {

        const card = document.createElement("div");

        card.textContent =
            `${course.subject} ${course.number}`;

        if (course.completed) {
            card.classList.add("completed");
        }

        container.appendChild(card);

    });

    const total = courseList.reduce(
        (sum, course) => sum + course.credits, 0
    );

    document.querySelector("#credits").textContent = total;

}

displayCourses(courses);