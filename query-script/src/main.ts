// use bluebird promises (has more concurrent options)
import * as Promise from 'bluebird';
// use axios to make HTTP API calls to the pet-store
import axios from 'axios';
// import quick and dirty pet store api types
import {PetTypes, PetDto, PetListWithCountsDto } from './pet-store-api-types';

// Set some constants based on the environment such that this script can run locally or in a docker container
const PET_STORE_HOST = process.env.PET_STORE_HOST || 'localhost';
const PET_STORE_PORT = parseInt(process.env.PET_STORE_PORT || '3330', 10);
const PET_STORE_URL = `http://${PET_STORE_HOST}:${PET_STORE_PORT}`;
const PET_STORE_URL_PET_API_V1 = `${PET_STORE_URL}/api/v1/pet`;

const roundUSD = (amount: number): string => `$${amount.toFixed(2)}`;

const printTotalCounts = async () => {
  const results = await Promise.all([
    axios.get<PetListWithCountsDto>(`${PET_STORE_URL_PET_API_V1}?type=${PetTypes.BIRD}&limit=1`),
    axios.get<PetListWithCountsDto>(`${PET_STORE_URL_PET_API_V1}?type=${PetTypes.CAT}&limit=1`),
    axios.get<PetListWithCountsDto>(`${PET_STORE_URL_PET_API_V1}?type=${PetTypes.DOG}&limit=1`),
    axios.get<PetListWithCountsDto>(`${PET_STORE_URL_PET_API_V1}?type=${PetTypes.REPTILE}&limit=1`),
    axios.get<PetListWithCountsDto>(`${PET_STORE_URL_PET_API_V1}?limit=1`),
    axios.get<PetListWithCountsDto>(`${PET_STORE_URL_PET_API_V1}?type=${PetTypes.CAT}&age[gte]=5&limit=1`),
  ]);

  console.log(`How many total pets are in the pet-shop? ${results[4].data.totalCount}`);
  console.log(`How many birds are in the pet-shop? ${results[0].data.filteredCount}`);
  console.log(`How many cats are in the pet-shop? ${results[1].data.filteredCount}`);
  console.log(`How many dogs are in the pet-shop? ${results[2].data.filteredCount}`);
  console.log(`How many reptiles are in the pet-shop? ${results[3].data.filteredCount}`);
  console.log(`How many cats are there with age equal to or greater than 5 in the pet-shop? ${results[5].data.filteredCount}`);
};

const printCostOfAllBirds = async () => {
  const birds = await axios.get<PetListWithCountsDto>(`${PET_STORE_URL_PET_API_V1}?type=${PetTypes.BIRD}&limit=100`);
  const totalCost = birds.data.data.reduce((sum, bird) => sum + bird.cost, 0);
  console.log(`How much would it cost to buy all the birds in the pet-shop? ${roundUSD(totalCost)}`);
};

const printAvgAgeOfPetsUnder90 = async () => {
  const pets = await axios.get<PetListWithCountsDto>(`${PET_STORE_URL_PET_API_V1}?cost[lt]=90&limit=100`);
  const ages = pets.data.data.map((p) => p.age);
  const avg = ages.reduce((a, b) => a + b, 0) / ages.length;
  console.log(`What is the average age of pets that cost less than $90.00? ${roundUSD(avg)}`);
};

const print3rdMostRecentlyUpdatedDog = async () => {
  const dogs = await axios.get<PetListWithCountsDto>(`${PET_STORE_URL_PET_API_V1}?type=${PetTypes.DOG}&limit=100`);
  const sorted = dogs.data.data.sort(
    (a, b) => new Date(b.updatedAt.toString()).getTime() - new Date(a.updatedAt.toString()).getTime()
  );  
  const thirdName = sorted[2]?.name || 'N/A';
  console.log(`What is the name of the 3rd most recently updated dog? ${thirdName}`);
};

(async () => {
  await printTotalCounts();
  await printCostOfAllBirds();
  await printAvgAgeOfPetsUnder90();
  await print3rdMostRecentlyUpdatedDog();
})();
