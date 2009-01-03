const clearButton = document.querySelector('.clear-button');
clearButton.addEventListener('click', () => {
  const courseInputElt = document.getElementById('course');
  courseInputElt.value = '';
  clearButton.style.display = 'none';
});

function academicSessionAutocomplete() {
  // console.log('Session input');
  semesterInput.innerHTML = '<option value="" disabled selected>Choose semester</option>';
  document.getElementById('course-list').innerHTML = '';
  document.getElementById('course').value = '';
  if (flattenedGrades[academicSessionInput.value]) {
    Object.keys(flattenedGrades[academicSessionInput.value]).forEach((sem) => {
      const option = document.createElement('option');
      option.value = sem;
      option.innerText = sem;
      semesterInput.appendChild(option);
    });
  }
  const elems = document.querySelectorAll('select');
  const instances = M.FormSelect.init(elems, {
    minLength: 0,
  });
}
function courseAutocomplete() {
  const courseInputElt = document.getElementById('course');
  if (courseInputElt.value.length > 0) {
    clearButton.style.display = 'block';
  } else {
    clearButton.style.display = 'none';
  }
  const course = document.getElementById('course').value.match(/\((.*)\)/)[1];
  const sem = document.querySelector('select').selectedOptions[0].value;
  const session = academicSessionInput.value;
  if (flattenedGrades[session] && flattenedGrades[session][sem] && flattenedGrades[session][sem][course]) {
    document.getElementById('course-name').textContent = `${flattenedGrades[session][sem][course].CourseName} - (${course})`;
    console.log(flattenedGrades[session][sem][course]);
    if (flattenedGrades[session][sem][course].Prof)
      document.getElementById('prof-name').textContent = `${flattenedGrades[session][sem][course].Prof}`;
    const legend = document.getElementById('legend');
    legend.innerHTML = '';
    const { CourseName, Grades } = flattenedGrades[session][sem][course];
    Object.keys(Grades).sort().forEach((grade) => {
      if (grade !== 'Total') {
        const listItem = document.createElement('li');
        const listName = document.createElement('em');
        const numbers = document.createElement('span');
        numbers.textContent = Grades[grade];
        listName.textContent = grade.trim();
        listItem.appendChild(listName);
        listItem.appendChild(numbers);
        legend.appendChild(listItem);
      }
    });
    document.getElementById('total-students').textContent = `Total students - ${flattenedGrades[session][sem][course].Grades.Total}`;
    createPie('.pieID.legend', '.pieID.pie');
  }
}
let flattenedGrades = null;
enableForm = () => {
  console.log('Form Enabled!');
  const autocompleteData = {};
  Object.keys(flattenedGrades).forEach((session) => {
    const option = document.createElement('option');
    option.value = session;
    document.getElementById('academic-session').appendChild(option);
    autocompleteData[session] = null;
  });
  const autoElems = document.querySelectorAll('.autocomplete');
  const autocompleteInstances = M.Autocomplete.init(autoElems, {
    data: autocompleteData,
    minLength: 0,
    onAutocomplete: academicSessionAutocomplete,
  });

  const courseAutocompleteInstances = M.Autocomplete.init(document.querySelectorAll('#course'), {
    onAutocomplete: courseAutocomplete,
    minLength: 0,
  });
  const url = new URL(window.location.href);
  const searchParams = new URLSearchParams(url.search);
  const session = searchParams.get('year');
  const sem = searchParams.get('sem');
  const course = searchParams.get('cno');
  // const session = yea
  // console.log(year,sem,cno);
  if (flattenedGrades[session] && flattenedGrades[session][sem] && flattenedGrades[session][sem][course]) {
    document.getElementById('course-name').textContent = `${flattenedGrades[session][sem][course].CourseName} - (${course})`;
    console.log(flattenedGrades[session][sem][course]);
    if (flattenedGrades[session][sem][course].Prof)
      document.getElementById('prof-name').textContent = `${flattenedGrades[session][sem][course].Prof}`;
    const legend = document.getElementById('legend');
    legend.innerHTML = '';
    const { CourseName, Grades } = flattenedGrades[session][sem][course];
    Object.keys(Grades).sort().forEach((grade) => {
      if (grade !== 'Total') {
        const listItem = document.createElement('li');
        const listName = document.createElement('em');
        const numbers = document.createElement('span');
        numbers.textContent = Grades[grade];
        listName.textContent = grade.trim();
        listItem.appendChild(listName);
        listItem.appendChild(numbers);
        legend.appendChild(listItem);
      }
    });
    document.getElementById('total-students').textContent = `Total students - ${flattenedGrades[session][sem][course].Grades.Total}`;
    createPie('.pieID.legend', '.pieID.pie');
  }
};
fetch('https://raw.githubusercontent.com/incog-nahito/grades/master/flattenedGrades.json')
  .then((res) => res.json())
  .then((grades) => {
    flattenedGrades = grades;
    enableForm();
  });
const academicSessionInput = document.getElementById('academic-session-input');
const semesterInput = document.getElementById('semester');
const courseList = document.getElementById('course-list');
academicSessionInput.addEventListener('input', academicSessionAutocomplete);
document.querySelector('select').addEventListener('change', () => {
  document.getElementById('course-list').innerHTML = '';
  document.getElementById('course').value = '';
  const sem = document.querySelector('select').selectedOptions[0].value;
  const session = academicSessionInput.value;
  if (flattenedGrades[session] && flattenedGrades[session][sem]) {
    document.getElementById('course').disabled = false;
    const updateData = {};
    const instance = M.Autocomplete.getInstance(document.getElementById('course'));
    Object.keys(flattenedGrades[session][sem]).forEach((courseID) => {
      updateData[`${flattenedGrades[session][sem][courseID].CourseName} - (${courseID})`] = null;
    });
    instance.updateData(updateData);
  }
});

document.getElementById('course').addEventListener('input', courseAutocomplete);

function sliceSize(dataNum, dataTotal) {
  return (dataNum / dataTotal) * 360;
}
function addSlice(sliceSize, pieElement, offset, sliceID, color) {
  $(pieElement).append(`<div class='slice ${sliceID}'><span></span></div>`);
  var offset = offset - 1;
  const sizeRotation = -179 + sliceSize;
  $(`.${sliceID}`).css({
    transform: `rotate(${offset}deg) translate3d(0,0,0)`,
  });
  $(`.${sliceID} span`).css({
    transform: `rotate(${sizeRotation}deg) translate3d(0,0,0)`,
    'background-color': color,
  });
}
function iterateSlices(sliceSize, pieElement, offset, dataCount, sliceCount, color) {
  const sliceID = `s${dataCount}-${sliceCount}`;
  const maxSize = 179;
  if (sliceSize <= maxSize) {
    addSlice(sliceSize, pieElement, offset, sliceID, color);
  } else {
    addSlice(maxSize, pieElement, offset, sliceID, color);
    iterateSlices(sliceSize - maxSize, pieElement, offset + maxSize, dataCount, sliceCount + 1, color);
  }
}
function createPie(dataElement, pieElement) {
  const listData = [];
  $(`${dataElement} span`).each(function () {
    listData.push(Number($(this).html()));
  });
  let listTotal = 0;
  for (var i = 0; i < listData.length; i++) {
    listTotal += listData[i];
  }
  let offset = 0;
  const color = [
    'cornflowerblue',
    'olivedrab',
    'orange',
    'tomato',
    'crimson',
    'purple',
    'turquoise',
    'forestgreen',
    'navy',
    'gray',
  ];
  for (var i = 0; i < listData.length; i++) {
    const size = sliceSize(listData[i], listTotal);
    iterateSlices(size, pieElement, offset, i, 0, color[i]);
    $(`${dataElement} li:nth-child(${i + 1})`).css('border-color', color[i]);
    offset += size;
  }
}
// createPie('.pieID.legend', '.pieID.pie');
