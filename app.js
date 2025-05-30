const priorityDropdownValue = document.getElementById("priority-dropdown");
const priorityDropdownList = document.getElementById("priority-dropdown-list");
const estimatedTimeValue = document.getElementById("estimatedTime");
const estimatedLabelTimeValue = document.getElementById("estimated-time-label-value");
const timeComponent = document.getElementById("time-components");
const estimatedTime = document.getElementById("estimatedTime");
const getFormName = document.getElementById("fname");
const getFormDescription = document.getElementById("fdescription");
const serviceCounter = document.getElementById("service-counter");
const pendingQueueDiv = document.getElementById("pending-queue");
const queueLengthSpan = document.getElementById("queue-length-span");
const addToQueuebtn = document.getElementById("add-to-queue");
let timer = 0;
let QueueList = [];
let ServiceCounterCount = 4;
let serviceArray = [];
const PriorityEnum = {
    1: "High",
    2: "Medium",
    3: "Low"
}
const waitForNextEntryCode = `<div class="d-flex flex-column justify-content-center align-items-center text-center" style="height: 12rem;">Waiting for next entry</div>`;

function updatePriorityDropdownValue(val) {
    priorityDropdownValue.innerText = PriorityEnum[val];
}

function createPriorityDropdown(){
    priorityDropdownList.innerHTML = '';
    for (const key in PriorityEnum) {
        priorityDropdownList.innerHTML += `<li><a class="dropdown-item" onclick = "updatePriorityDropdownValue(${key})">${PriorityEnum[key]}</a></li>`
    }
}

function saveQueueDetails() {
    QueueList.push(
        {
            "name": getFormName.value,
            "description": getFormDescription.value,
            "priority": priorityDropdownValue.innerText.trim(),
            "estimatedTime": estimatedTimeValue.valueAsNumber,
            "timeComponent": timeComponent.innerText,
            "id": Math.floor(Math.random() * 6)
        });
}

function getPriorityKeyFromValue(value){
    return Object.keys(PriorityEnum).find(key => PriorityEnum[key] === value);
}

function storeInLocalStorage(queueArray) {
    queueArray.sort((a,b) => getPriorityKeyFromValue(a.priority) - getPriorityKeyFromValue(b.priority))
    setQueueList(queueArray);
}

function getQueueList(){
    return JSON.parse(localStorage.getItem('queue__list')) != null ? JSON.parse(localStorage.getItem('queue__list')) : []
}

function setQueueList(queueArray){
    return localStorage.setItem("queue__list", JSON.stringify(queueArray));
}

function setServiceArray(serviceArray){
    return localStorage.setItem("pendingQueueList", JSON.stringify(serviceArray));
}

function getPendingQueueList(elementId){
    return JSON.parse(localStorage.getItem(elementId)) != null ? JSON.parse(localStorage.getItem(elementId)) : []
}

function pendingQueueList(){
    pendingQueueDiv.innerHTML = '';
    QueueList = getQueueList();
    QueueList.forEach(e => {
        pendingQueueDiv.innerHTML += `
        <div class="list-group-item" id="${e.id}">
            <h5>${e.name}</h5>
            <span class="badge text-bg-secondary">Waiting</span>
            <span>${e.estimatedTime} ${e.timeComponent}</span>
            <span class="${e.priority}">${e.priority}</span>
        </div>
        `
    });
    queueLengthSpan.innerHTML = QueueList.length;
}

function serviceCounterCardCreation(id, queueListEntry){
    return `<div class="card" style="width: 18rem;">
        <div class="card-body">
            <div class="card-title h6" id = "counter">
                <span class="me-1 h5">Counter ${id}</span>
                <span class="badge rounded-pill text-bg-secondary service-status">Available</span>
            </div>
            <div class="card-text" id="queue-list-${id}">
                ${queueListEntry}
            </div>
        </div>
    </div>`
}

function createServiceCounterCard(ServiceCounterCount){
    serviceCounter.innerHTML = '';
    for(let i=1; i <= ServiceCounterCount; i++){
        serviceCardCode = serviceCounterCardCreation(i, waitForNextEntryCode);
        serviceArray.push({id: `${i}`, isServiceFree: false, serviceCard: waitForNextEntryCode, queueProgressList: '', queueId: ''});
        serviceCounter.innerHTML += serviceCardCode;
    }
    setServiceArray(serviceArray);
}

function addQueueEnterInServiceCounter(inProgressArray){
    return `
    <div class="card" id = "${inProgressArray.id}">
        <div class="card-body">
            <p class="card-title h6">${inProgressArray.name}</p>
            <p class="text-secondary card-subtitle" description>${inProgressArray.description}</p>
            <div>
                <small class="text-secondary" time>Est. ${inProgressArray.estimatedTime} ${inProgressArray.timeComponent}</small>
                <small class="${inProgressArray.priority}" priority>${inProgressArray.priority} Priority</small>
            </div>
            <div class="mt-2" name = "${inProgressArray.id}">
                <button name="complete-queue">Complete</button>
                <button name="cancel-queue">Cancel</button>
            </div>
        </div>
        <div class="card-footer" id="queue-counter-timer-${inProgressArray.id}"></div>
    </div>`
}

function setInit(queueTimer, getQueryElement, entryInService, timer){
    const counterTimer = setInterval(function () {
        timer -= 1;
        queueTimer.innerHTML = `<span> ${Math.floor((timer)/60)} : ${(timer)%60}</span>`;
    }, 1000);
    setTimeout(function () {
        clearInterval(counterTimer);
        entryInService.isServiceFree = false;
        setServiceArray(serviceArray);
        if(QueueList.length != 0) {
            addQueueEntryInService();
        }
        else{
            getQueryElement.innerHTML =  waitForNextEntryCode;
        }
    }, entryInService.queueProgressList.estimatedTime * 60 * 1000);
}

function addQueueEntryInService(){
    QueueList = getQueueList();
    if(QueueList.length != 0){
        const entryInService = serviceArray.find(_ => _.isServiceFree == false);
        if(entryInService){
            entryInService.isServiceFree = true;
            setServiceArray(serviceArray);
            const getQueryElement = document.getElementById(`queue-list-${entryInService.id}`);
            entryInService.queueProgressList = QueueList.shift();
            entryInService.queueId = QueueList.id;
            getQueryElement.innerHTML = addQueueEnterInServiceCounter(entryInService.queueProgressList);
            const queueCounterTimer = document.getElementById(`queue-counter-timer-${entryInService.queueProgressList.id}`);
            timer = entryInService.queueProgressList.estimatedTime * 60;
            queueCounterTimer.innerHTML = `<span> ${Math.floor((timer)/60)} : ${(timer)%60}</span>`;
            setInit(queueCounterTimer, getQueryElement, entryInService, timer)
        }
        if(QueueList.length != 0){
            setQueueList(QueueList);
        }
        else{
            setQueueList([]);
        }
        pendingQueueList();
    }
}

createPriorityDropdown();
createServiceCounterCard(ServiceCounterCount);
pendingQueueList();
addQueueEntryInService();

addToQueuebtn.addEventListener('click', () => {
    saveQueueDetails();
    storeInLocalStorage(QueueList);
    pendingQueueList();
    addQueueEntryInService();
});

estimatedTime.addEventListener('input', (e) => {
    if(+e.target.value == 60){
        estimatedLabelTimeValue.innerText = 1;
        timeComponent.innerText = "hour";
    }
    else if(+e.target.value == 1){
        estimatedLabelTimeValue.innerText = +e.target.value;
        timeComponent.innerText = "minute";
    }
    else{
        estimatedLabelTimeValue.innerText = +e.target.value;
        timeComponent.innerText = "minutes";
    }
});


