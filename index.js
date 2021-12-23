const testMode = true;
const baseSpacexURL = testMode ? "http://localhost:3000/" : "https://api.spacexdata.com/v4/";

function dropHandler(event) {
  // event.preventDefault();
  const id = event.dataTransfer.getData("text/plain");
  console.log("dropped id = ", id);
  const dropped = document.querySelector(`[data-rocket-id="${id}"]`);
  const imgSource = dropped.dataset.rocketImage;
  const div = document.querySelector(".mission-assembly");
  const img = document.createElement("img");
  img.src = imgSource;
  div.append(img);
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

/*

function buildAstrosURL() {
  let url = `https://${apiTesting ? "lldev" : "ll"}.thespacedevs.com/2.2.0/astronaut/?format=json`;
    url = url + "&active=1";
    url = url + "&nationality=American";
    url = url + "&ordering=name";
    url = url + "&limit=100"; // 100 appears to be the max
    url = url + "&offset=400";
    return url;
}

function fetchAstronauts() {
  fetch(buildAstrosURL())
    .then(resp => resp.json())
    .then(astros => {
      for (astro of astros.results) {
        astronauts.push({
          id: astro.id,
          name: astro.name,
          dob: astro.date_of_birth,
          nationality: astro.nationality,
          lastFlight: astro.last_flight,
          firstFlight: astro.first_flight,
          wiki: astro.wiki,
          profileImageThumbnail: astro.profile_image_thumbnail,
          profileImage: astro.profile_image,
        })
      }
      console.log(astronauts);
    });
}

function fetchDragons() {
  for (dragon of dragonsSimulation) {
    dragons.push( {
      name: dragon.name,
      firstFlight: dragon.first_flight,
      crewCapacity: dragon.crew_capacity,
      active: dragon.active,
      wiki: dragon.wikipedia,
      images: dragon.flickr_images,
    } );

  }
}

function fetchCapsules() {
  for (capsule of capsulesSimulation) {
    if (capsule.status === "active") {
      capsules.push( {
        reuseCount: capsule.reuse_count,
      })
    }
  }
}


*/

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
    capsule: (collection) => collection.filter((item) => item.status === "active" && parseInt(item.water_landings, 10) > 0)
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
    renderCapsule(capsule, tableBody.insertRow());
  })
}

const renderCapsule = (item, row) => {
  row.innerHTML = `<td>${item.serial}</td>`
    + `<td>${item.type}</td>`
    + `<td>${item.launches.length}</td>`
    + `<td>${item.water_landings}</td>`;
    // + `<td>${item.last_update}</td>`
  row.dataset.capsuleId = item.id;
  row.className = "core-row";
  row.draggable = true;
  row.addEventListener("dragstart", dragstartHandler);
  // row.addEventListener("mouseover", handleRowHover);
}

document.addEventListener("DOMContentLoaded", (e) => {

  fetch(baseSpacexURL + "launches")
    .then(resp => resp.json())
    .then(result => {
      initPriorLaunches(result);
      fetch(baseSpacexURL + "rockets")
        .then(resp => resp.json())
        .then(result => {
          renderRockets(configurator.rocket(result));
        });
      fetch(baseSpacexURL + "cores")
        .then(resp => resp.json())
        .then(result => {
          renderCores(configurator.core(result));
        });
      fetch(baseSpacexURL + "capsules")
        .then(resp => resp.json())
        .then(capsulesData => {
          fetch(baseSpacexURL + "dragons")
            .then(resp => resp.json())
            .then(dragonsData => 
              renderCapsules(configurator.capsule(capsulesData), dragonsData));
            
        });

    });


  const boxElement = document.querySelector(".box");
  console.log(boxElement);
  boxElement.addEventListener("drop", dropHandler);
  boxElement.addEventListener("dragover", dragoverHandler);

})
