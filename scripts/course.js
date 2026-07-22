const courses = [

    {
        subject: "WDD",
        number: 130,
        title: "Web Fundamentals",
        credits: 3,
        completed: true,
        certificate: "Web and Computer Programming",
        description: "Introduction to HTML, CSS, and basic web development principles.",
        technology: [
            "HTML",
            "CSS",
            "GitHub"
        ]
    },


    {
        subject: "WDD",
        number: 131,
        title: "Dynamic Web Fundamentals",
        credits: 3,
        completed: true,
        certificate: "Web and Computer Programming",
        description: "Learn JavaScript fundamentals and create dynamic websites.",
        technology: [
            "JavaScript",
            "HTML",
            "CSS"
        ]
    },


    {
        subject: "WDD",
        number: 231,
        title: "Frontend Web Development",
        credits: 3,
        completed: false,
        certificate: "Web and Computer Programming",
        description: "Build responsive websites using modern frontend development techniques.",
        technology: [
            "JavaScript",
            "CSS Grid",
            "Responsive Design"
        ]
    },


    {
        subject: "CSE",
        number: 110,
        title: "Programming Building Blocks",
        credits: 2,
        completed: true,
        certificate: "Programming",
        description: "Introduction to programming concepts using Python.",
        technology: [
            "Python",
            "Problem Solving"
        ]
    },


    {
        subject: "CSE",
        number: 111,
        title: "Programming with Functions",
        credits: 2,
        completed: false,
        certificate: "Programming",
        description: "Learn functions, data structures, and object-oriented programming concepts.",
        technology: [
            "Python",
            "Functions",
            "Objects"
        ]
    }

];


const container = document.querySelector("#course-container");

const courseDetails = document.querySelector("#course-details");



function displayCourses(courseList) {

    container.innerHTML = "";


    courseList.forEach(course => {


        const card = document.createElement("div");


        card.textContent =
            `${course.subject} ${course.number}`;


        if (course.completed) {

            card.classList.add("completed");

        }


        card.addEventListener("click", () => {

            displayCourseDetails(course);

        });


        container.appendChild(card);

    });



    const total = courseList.reduce(
        (sum, course) => sum + course.credits,
        0
    );


    document.querySelector("#credits").textContent = total;

}



function displayCourseDetails(course) {


    courseDetails.innerHTML = `

        <button id="closeModal">❌</button>

        <h2>
            ${course.subject} ${course.number}
        </h2>


        <h3>
            ${course.title}
        </h3>


        <p>
            <strong>Credits:</strong>
            ${course.credits}
        </p>


        <p>
            <strong>Certificate:</strong>
            ${course.certificate}
        </p>


        <p>
            ${course.description}
        </p>


        <p>
            <strong>Technology:</strong>
            ${course.technology.join(", ")}
        </p>

    `;



    courseDetails.showModal();



    document.querySelector("#closeModal")
        .addEventListener("click", () => {

            courseDetails.close();

        });



}



courseDetails.addEventListener("click", (event) => {

    if (event.target === courseDetails) {

        courseDetails.close();

    }

});



displayCourses(courses);



document.querySelector("#all")
    .addEventListener("click", () => {

        displayCourses(courses);

    });



document.querySelector("#wdd")
    .addEventListener("click", () => {

        displayCourses(
            courses.filter(course => course.subject === "WDD")
        );

    });



document.querySelector("#cse")
    .addEventListener("click", () => {

        displayCourses(
            courses.filter(course => course.subject === "CSE")
        );

    });