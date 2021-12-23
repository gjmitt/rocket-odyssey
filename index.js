const testMode = true;
const baseSpacexURL = testMode ? "http://localhost:3000/" : "https://api.spacexdata.com/v4/";

function dropHandler(event) {
  // event.preventDefault();
  const id = event.dataTransfer.getData("text/plain");
  console.log("dropped id = ", id);
  const dropped = document.querySelector(`[data-rocket-id="${id}"]`);
  const imgSource = dropped.dataset.rocketImage;
  const div = document.createElement("div");
  div.className = "mission-part";
  const img = document.createElement("img");
  img.className = "mission-part-img";
  img.src = imgSource;
  div.append(img);
  document.querySelector(".mission-assembly").append(div);
}

function dragoverHandler(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = "copy";
}

function dragstartHandler(event) {
  event.dataTransfer.setData("text/plain", event.target.dataset.rocketId);
  event.dataTransfer.dropEffect = "copy";
  console.log(event.target);
}

const buildAstronautURL = () => {
  // api provides a testing endpoint with slightly stale data, use that when testing.
  return url = `https://${testMode ? "lldev" : "ll"}.thespacedevs.com/2.2.0/astronaut/?format=json`
    + "&active=1"
    + "&nationality=American"
    + "&ordering=name"
    + "&limit=100" // 100 appears to be the max
//    + "&offset=100";
}

const renderRockets = (rockets) => {
  const tableBody = document.querySelector("#rockets-body");
  tableBody.innerHTML = "";
  rockets.forEach(rocket => {
    renderRocket(rocket, tableBody.insertRow());
  })
}

const renderRocket = (rocket, row) => {
  row.innerHTML = `<td>${rocket.name}</td>`
    + `<td>${rocket.cost_per_launch}</td>`
    + `<td>${rocket.engines.type}(${rocket.engines.number})</td>`
    + `<td>${rocket.first_flight}</td>`
    + `<td>${rocket.success_rate_pct}</td>`;
  row.dataset.rocketId = rocket.id;
  row.dataset.rocketImage = rocket.flickr_images[0];
  row.className = "rocket-row";
  row.draggable = true;
  row.addEventListener("dragstart", dragstartHandler);
  // row.addEventListener("mouseover", handleRowHover);
}

const assembly = function () {
  /* 
    assembly() maintains mission parts.
    Intializes an empty object with crew array to simplify the logic.
    "crew" is the only key with multiple values.
    Coded another version of this allowing any key to have multiple values
      (value is a string if only 1, or an array if > 1) but code become more 
      complicated and decided instead to do it this way with separate methods
      for adding and deleting crew.
  */
  const mission = { crew: [] };
  return {
    add: (partName, partId) => mission[partName] = partId,
    delete: (partName) => delete mission[partName],
    show: () => mission,
    addCrew: (newCrew) => mission.crew.push(newCrew),
    deleteCrew: (oldCrew) => mission.crew = mission.crew.filter(item => item != oldCrew)
  }
}();

const configurator = function () {
  /*
    configurator() filters mission parts so user-interface lists  
      rockets, boosters, etc. that appear practical for assembling a mission.  
    I originally thought that it would be sufficient to select parts that were
      used on prior missions, but after further reserch more filter critera
      were needed.
  */
  const priorLaunches = [];
  return {
    push: (launch) => priorLaunches.push(launch),
    rocket: (collection) => collection.filter((item) => item.name != "Falcon 1"),
    core: (collection) => {
      return collection.filter((item) => {
          return (item.status === "unknown" || item.status === "active")
            && priorLaunches.find(launch => item.id === launch.coreId)
        });
    },
    capsule: (collection) => collection.filter((item) => item.status === "active" && parseInt(item.water_landings, 10) > 0), 
    astronaut: (collection) => collection.filter(item => item.status.name === "Active")
  }
}();

const initPriorLaunches = (launches) => {
  /* 
    Populate past launches to allow configuration of mission parts.
    Include only successful launches.
    Simplify the data structure, e.g. avoid arrays when array only has 1 element.
  */

  for (const launch of launches) {
    if (launch.success) {
      const prior = {
        launchId: launch.id,
        capsule: launch.capsules.length ? launch.capsules[0] : null,
        rocket: launch.rocket,
        crew: launch.crew,
        payloadsCount: launch.payloads.length,
        launchpad: launch.launchpad,
        flightNumber: launch.flight_number,
      }
      if (launch.cores.length) {
        prior.coreId = launch.cores[0].core;
        prior.coreFlightNumber = launch.cores[0].flight;
        prior.coreReusedFlag = launch.cores[0].reused;
      }
      configurator.push(prior);
    }
  }
}

const renderCores = (cores) => {
  const tableBody = document.querySelector("#cores-body");
  tableBody.innerHTML = "";
  cores.forEach(core => renderCore(core, tableBody.insertRow()));
}

// serial, flown, landed, note
const renderCore = (item, row) => {
  row.innerHTML = `<td>${item.serial}</td>`
    + `<td>${item.reuse_count}</td>`
    + `<td>${item.asds_landings}</td>`;
    // + `<td>${item.last_update}</td>`;
  row.dataset.coreId = item.id;
  row.className = "core-row";
  row.draggable = true;
  row.addEventListener("dragstart", dragstartHandler);
  // row.addEventListener("mouseover", handleRowHover);
}

const renderCapsules = (capsules, dragons) => {
  const tableBody = document.querySelector("#capsules-body");
  tableBody.innerHTML = "";
  capsules.forEach(capsule => {
    // capsule.type of "Dragon n.x" matches to dragon.name of "Dragon 1" or "Dragon 2"
    const dragon = dragons.find(item => item.name === capsule.type.slice(0, item.name.length))
    renderCapsule(capsule, dragon, tableBody.insertRow());
  })
}

const renderCapsule = (item, dragon, row) => {
  row.innerHTML = `<td>${item.type}</td>`
    + `<td>${dragon.crew_capacity}</td>`
//    + `<td>${dragon.first_flight}</td>`
    + `<td>${item.serial}</td>`
    + `<td>${item.launches.length}</td>`
    + `<td>${item.water_landings}</td>`;
  row.dataset.capsuleId = item.id;
  row.dataset.dragonImages = dragon.flickr_images;
  row.className = "capsule-row";
  row.draggable = true;
  row.addEventListener("dragstart", dragstartHandler);
  // row.addEventListener("mouseover", handleRowHover);
}

const renderAstronauts = (astronauts) => {
  const tableBody = document.querySelector("#astros-body");
  tableBody.innerHTML = "";
  astronauts.forEach(astronaut => {
    renderAstronaut(astronaut, tableBody.insertRow());
  })

}

const renderAstronaut = (item, row) => {
  row.innerHTML = `<td>${item.name}</td>`
    + `<td>${item.date_of_birth}</td>`
    + `<td>${item.first_flight}</td>`
    + `<td>${item.last_flight}</td>`;
  row.dataset.astronautId = item.id;
  row.dataset.astronautImage = item.profile_image;
  row.className = "astro-row";
  row.draggable = true;
  row.addEventListener("dragstart", dragstartHandler);

}

document.addEventListener("DOMContentLoaded", (e) => {

  fetch(baseSpacexURL + "launches")
  .then(resp => resp.json())
  .then(result => {
    initPriorLaunches(result);
    fetch(baseSpacexURL + "rockets")
    .then(resp => resp.json())
    .then(result => renderRockets(configurator.rocket(result)));
    fetch(baseSpacexURL + "cores")
    .then(resp => resp.json())
    .then(result => renderCores(configurator.core(result)));
    fetch(baseSpacexURL + "capsules")
    .then(resp => resp.json())
    .then(capsulesData => {
      fetch(baseSpacexURL + "dragons")
      .then(resp => resp.json())
      .then(dragonsData => renderCapsules(configurator.capsule(capsulesData), dragonsData));
    });
    fetch(buildAstronautURL())
    .then(resp => resp.json())
    .then(result => renderAstronauts(configurator.astronaut(result.results)));
  });

  const boxElement = document.querySelector(".box");
  console.log(boxElement);
  boxElement.addEventListener("drop", dropHandler);
  boxElement.addEventListener("dragover", dragoverHandler);

})
