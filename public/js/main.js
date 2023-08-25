const server = 'http://localhost:30009';
var studentId;
var studentName;

async function fetchStudents() {
  const url = server + '/students'; // defines the URL endpoint to fetch the students data from
  const options = {
    method: 'GET', // sets the HTTP method to GET
    headers: {
      'Accept' : 'application/json' // sets the Accept header to request JSON data from the server
    }
  }
  const response = await fetch(url, options); // performs a fetch request to the server with the given URL and options
  const students = await response.json(); // extracts the JSON data from the response and assigns it to the 'students' variable
  populateContent(students); // calls the 'populateContent' function to display the fetched students data on the page
}

async function updateStudent(id, name) {
  const url = `${server}/students/${id}`; // defines the URL endpoint to update the student with the given 'id'
  const student = {
      name: name // defines the 'name' property of the student object to be updated
  };
  const options = {
      method: 'PATCH', // sets the HTTP method to PATCH
      headers: {
          'Content-Type': 'application/json' // sets the Content-Type header to indicate that the body of the request contains JSON data
      },
      body: JSON.stringify(student) // sets the body of the request to be the JSON representation of the 'student' object
  };
  const response = await fetch(url, options); // performs a fetch request to the server with the given URL and options
}

async function addStudent() {
  if (studentId < 0 || studentId > 100) { // checks if the entered student ID is within the valid range
    alert('Please enter a valid student mark between 0 and 100.'); // displays an error message if the student ID is invalid
    return; // exits the function
  }
  const url = server + '/students'; // defines the URL endpoint to add a new student
  const student = {
    id: studentId, // defines the 'id' property of the new student object
    name: studentName // defines the 'name' property of the new student object
  };
  const options = {
    method: 'POST', // sets the HTTP method to POST
    headers: {
      'Content-Type': 'application/json' // sets the Content-Type header to indicate that the body of the request contains JSON data
    },
    body: JSON.stringify(student) // sets the body of the request to be the JSON representation of the 'student' object
  };
  const response = await fetch(url, options); // performs a fetch request to the server with the given URL and options
}




// Async function to delete a student with a specific ID from the server
async function deleteStudent(id) {
  const url = `${server}/students/${id}`; // URL for the DELETE request
  const options = {
    method: 'DELETE', // HTTP method for the request
    headers: {
      'Content-Type' : 'application/json' // request headers
    }
  }
  const response = await fetch(url, options); // send the DELETE request to the server
}

// Function to populate the table of students in the HTML document
function populateContent(students) {
  var table = document.getElementById('content'); // get the table element from the HTML document
  table.innerHTML = "<tr><th>Student Marks</th><th>Student Name</th><th>Actions</th></tr>"; // add a header row to the table
  students.forEach(student => {
    var row = document.createElement('tr'); // create a new row element
    var dataId = document.createElement('td'); // create a new cell element for the student ID
    var textId = document.createTextNode(student.id); // create a text node for the student ID
    dataId.appendChild(textId); // add the text node to the cell element
    var dataName = document.createElement('td'); // create a new cell element for the student name
    var textName = document.createTextNode(student.name); // create a text node for the student name
    dataName.appendChild(textName); // add the text node to the cell element
    var dataActions = document.createElement('td'); // create a new cell element for the edit and delete buttons

    // create an edit button for the student and add an event listener to update the student's information
    var editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => {
      var newId = prompt("Enter new Marks:", student.id);
      var newName = prompt("Enter new Name:", student.name);
      if (newId && newName) {
        if (newId < 0 || newId > 100) {
          alert('Please enter a valid student mark between 0 and 100.');
          return;
        }
          updateStudent(student.id, newName);
          studentId = parseInt(newId);
          studentName = newName;
          addStudent();
          fetchStudents();
      }
      deleteStudent(student.id); // delete the old student from the server
      table.removeChild(row); // remove the old student from the HTML document
  });

    // create a delete button for the student and add an event listener to remove the student from the server and HTML document
    var deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', function() {
      deleteStudent(student.id);
      table.removeChild(row);
    });
    dataActions.appendChild(editButton); // add the edit button to the cell element
    dataActions.appendChild(deleteButton); // add the delete button to the cell element
    row.appendChild(dataId); // add the student ID cell to the row element
    row.appendChild(dataName); // add the student name cell to the row element
    row.appendChild(dataActions); // add the edit and delete button cell to the row element
    table.appendChild(row); // add the row element to the table
  });
  
  
  var medianButton = document.getElementById('medianButton');
  if (!medianButton) {
    medianButton = document.createElement('button');
    medianButton.setAttribute('id', 'medianButton');
    medianButton.textContent = 'Median';
    medianButton.addEventListener('click', function() {
      const students = Array.from(document.querySelectorAll("#content tr"))
        .slice(1)
        .map((row) => ({
          id: Number(row.children[0].textContent),
          name: row.children[1].textContent,
        }))
        .sort((a, b) => a.id - b.id); // sort by student ID
        
      var ids = students.map(s => s.id).sort((a, b) => a - b);
      var len = ids.length;
      var median = len % 2 === 0 ? (ids[len/2-1] + ids[len/2])/2 : ids[Math.floor(len/2)];
      alert(`Median student id is ${median}`);
    });
    document.body.appendChild(medianButton);
  }
  
}

function displayGraph() {
  const students = Array.from(document.querySelectorAll("#content tr"))
    .slice(1)
    .map((row) => ({
      id: Number(row.children[0].textContent),
      name: row.children[1].textContent,
    }))
    .sort((a, b) => a.id - b.id); // sort by student Marks

  const xValues = students.map((student) => student.name);
  const yValues = students.map((student) => student.id);

  const ids = yValues.sort((a, b) => a - b);
  const len = ids.length;
  const median =
    len % 2 === 0 ? (ids[len / 2 - 1] + ids[len / 2]) / 2 : ids[Math.floor(len / 2)];

  let chart = null;
  const canvas = document.getElementById("myChart");
  
  if (canvas) {
    chart = Chart.getChart(canvas);
    chart.data.labels = xValues;
    chart.data.datasets[0].data = yValues;
    chart.data.datasets[1].data = [      { x: xValues[0], y: median },
      { x: xValues[xValues.length - 1], y: median },
    ];
    chart.update();
  } else {
    const canvas = document.createElement("canvas");
    canvas.id = "myChart";
    canvas.width = 2000;
    canvas.height = 1200;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: xValues,
        datasets: [
          {
            label: "Student Marks vs. Student Name",
            data: yValues,
            fill: false,
            borderColor: "blue",
            tension: 0,
          },       
          {
            type: "line",
            label: "Median",
            borderColor: "red",
            borderWidth: 1,
            borderDash: [5, 5],
            data: [
              { x: xValues[0], y: median },
              { x: xValues[xValues.length - 1], y: median },
            ],
            fill: false,
          },
        ],
      },
      options: {
        scales: {
          axisX: [
            {
              title:"Student Name",
              scaleLabel: {
                display: true,
                
              },

            },
          ],
          axisY: [
            {
              title:"Student Marks",
              scaleLabel: {
                display: true,
              },

              ticks: {
                min: 0,
                max: 100,
              },
            },
          ],
        },
      },
    });
  }
}



document.querySelector('form').addEventListener('submit', (e) => {
  studentId = document.getElementById('studentId').value;
  studentName = document.getElementById('studentName').value;
  if (studentId && studentName) {
    studentId = parseInt(studentId);
    addStudent();
    fetchStudents();
  }
  e.preventDefault();
});

fetchStudents();