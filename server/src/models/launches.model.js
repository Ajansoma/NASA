const axios = require('axios');
const launches = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;

// const launches = new Map();

// let latestFlightNumber = 100;
// const launch = {
//   flightNumber: 100,
//   mission: 'Kepler Exploration X',
//   rocket: 'Explorer IS1',
//   launchDate: new Date('December 27, 2030'),
//   target: 'Kepler-62 f',
//   customers: ['ZTM', 'NASA'],
//   upcoming: true,
//   success: true,
// };

const SPACEX_API_URL = ` https://api.spacexdata.com/v5/launches/query`;

const populateLaunches = async function () {
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: 'rocket',
          select: {
            name: 1,
          },
        },
        {
          path: 'payloads',
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  const launchDocs = response.data.docs;

  for (const launchDoc of launchDocs) {
    const payloads = launchDoc['payloads'];
    const customers = payloads.flatMap((payload) => {
      return payload['customers'];
    });

    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'],
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
      customers,
    };
    console.log(launch.flightNumber);

    await saveLaunch(launch);
  }
};

const loadLaunchData = async function () {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat',
  });

  if (firstLaunch) {
    console.log('launch exists already');
  } else {
    await populateLaunches();
  }
};

const findLaunch = async function (filter) {
  return await launches.findOne(filter);
};

const existsLaunchWithId = async function (launchId) {
  return await launches.findOne({
    flightNumber: launchId,
  });
  // return launches.has(launchId);
};

const getLatestFlightNumber = async function () {
  const latestLaunch = await launches.findOne().sort('-flightNumber');

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }

  return latestLaunch.flightNumber;
};

const getAllLaunches = async function (skip, limit) {
  return await launches
    .find({}, { '_id': 0, '__v': 0 })
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
};

const saveLaunch = async function (launch) {
  await launches.updateOne(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    { upsert: true }
  );
};

// saveLaunch(launch);
// launches.set(launch.flightNumber, launch);

const scheduleNewLaunch = async function (launch) {
  const planet = await planets.findOne({});
  if (!planet) {
    throw new Error('no matching planet was found');
  }

  const newFlightNumber = (await getLatestFlightNumber()) + 1;

  const newLaunch = Object.assign(launch, {
    flightNumber: newFlightNumber,
    success: true,
    upcoming: true,
    customers: ['ZTM', 'NASA'],
  });

  await saveLaunch(newLaunch);
};

// const addNewLaunch = async function (launch) {
//   // latestFlightNumber++;
//   // launches.set(
//   //   latestFlightNumber,
//   //   Object.assign(launch, {
//   //     success: true,
//   //     upcoming: true,
//   //     customer: ["ZTM", "NASA"],
//   //     flightNumber: latestFlightNumber,
//   //   })
//   // );
// };

const abortLaunchById = async function (launchId) {
  const aborted = await launches.updateOne(
    {
      flightNumber: launchId,
    },
    { upcoming: false, success: false }
  );
  return aborted.modifiedCount === 1;
  // const aborted = launches.get(launchId);
  // aborted.upcoming = false;
  // aborted.success = false;
  // return aborted;
};

module.exports = {
  loadLaunchData,
  existsLaunchWithId,
  getAllLaunches,
  scheduleNewLaunch,
  // addNewLaunch,
  abortLaunchById,
};

// return Array.from(launches.values());
