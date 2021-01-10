/* eslint-disable @typescript-eslint/camelcase */
import { TreeTypes, TreeValidationTypes } from './../treeData'
import { firestore } from 'firebase'

interface TreePhoto {
  width: number
  height: number
  url: string
}

export interface TreeData {
  userId: string
  username: string
  photo: TreePhoto
  coords: firestore.GeoPoint
  speciesNameScientific: string
  speciesNameCommon: string
  dbh?: string
  estmated_dbh: boolean
  treeType: TreeTypes
  landUseCategory: string
  treeConditionCategory: string
  crownLightExposureCategory: string
  locationType: string
  notes: string | null
  isValidated: TreeValidationTypes
  level: string
  modelName: string | null
  os_name: string | null
  os_version: string | null
  applicationVersion: string | null
  BuildVersion: string | null
  brand: string | null
  NationFullName: string | null
  StateAbbr: string | null
  CountyName: string | null
  CityName: string | null
  CalculatedCrownHeightMeter: string | null
  CalculatedCrownWidthMeter: string | null
  RunoffAvoided: string | null
  RunoffAvoidedValue: string | null
  Interception: string | null
  PotentialEvaporation: string | null
  PotentialEvapotranspiration: string | null
  Evaporation: string | null
  Transpiration: string | null
  CORemoved: string | null
  CORemovedValue: string | null
  NO2Removed: string | null
  NO2RemovedValue: string | null
  SO2Removed: string | null
  SO2RemovedValue: string | null
  O3Removed: string | null
  O3RemovedValue: string | null
  PM25Removed: string | null
  PM25RemovedValue: string | null
  CO2Sequestered: string | null
  CO2SequesteredValue: string | null
  CarbonStorage: string | null
  CarbonDioxideStorage: string | null
  CarbonDioxideStorageValue: string | null
  DryWeight: string | null
}

const TREES_COLLECTION = 'trees'

export function addTree(treeData: TreeData) {
  firestore()
    .collection(TREES_COLLECTION)
    .add({
      ...treeData,
      created_at: firestore.FieldValue.serverTimestamp(),
    })
}
