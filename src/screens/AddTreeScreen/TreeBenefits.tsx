import React, { useState, useEffect} from 'react'
import axios from 'axios';
import { xml2js, xml2json } from 'xml-js'
import { Modal, View, ScrollView, StyleSheet } from 'react-native'
import * as Location from 'expo-location'
import * as Premmissions from 'expo-premmissions'

import { Banner, Text, Headline, Button } from 'react-native-paper'
import { StatusBar } from '../../components/StatusBar'
import { CONFIG } from '../../../envVariables'
import { FormValues } from './addTreeForm';
import { Benefit, RootObject } from './TreeBenefitResponse';
import { convertRegion } from './geoHelper'

// 1 Cubic meter (m3) is equal to 264.172052 US gallons
// https://www.asknumbers.com/cubic-meters-to-gallons.aspx
const CUBIC_GALLONS_FACTOR = 264.172052;

interface TreeBenefitsProps {
  values: FormValues
}

const styles = StyleSheet.create({
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 15,
    paddingLeft: 25,
  },
  tableRowHeader: {
    paddingLeft: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  tableCell: {
    flex: 1,
    flexDirection: 'row',
  },
  tableCellRight: {
    flex: 0.3,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  headerTitleStyle: {
    fontWeight: 'bold',
    color: '#000',
    fontSize: 14,
  },
})

export function TreeBenefits(props: TreeBenefitsProps) {
  const [isModalVisible, setIsModalVisible] = React.useState<boolean>(false)
  const [benefits, setBenefits] = React.useState<Benefit>()
  const [, setFormattedResponse] = React.useState("")
  const { values } = props;
  const { crownLightExposureCategory, dbh, speciesData, treeConditionCategory } = values;
  const [errorMessage, setErrorMessage] = React.useState<null | string>(null)
  const [location, setLocation ] = React.useState<Object>(null)
  const [address, setAddress ] = React.useState<Object>(null);
  const [currentCoords, setCurrentCoords] = React.useState<Object>(null)
  const canCalculateBenefits = !!(
    speciesData
    && crownLightExposureCategory
    && dbh
    && speciesData
    && treeConditionCategory);

// Todo add devices location to API_TREE_BENEFIT
useEffect(() => {

   (async () => {
     let { status } = await Location.requestPermissionsAsync();
     if (status !== 'granted') {
       setErrorMsg('Permission to access location was denied');
       return;
     }
     const location = await Location.getCurrentPositionAsync({});

     setLocation(location);
     setCurrentCoords({
       latitude: location.coords.latitude,
       longitude: location.coords.longitude,

       //grand canyon
       // latitude: 36.2368592,
       // longitude:  -112.1914682,
       //nyc
       // latitude: 40.71427,
       // longitude: -74.00597,
     })
     console.log(location)
     const readOnlyAddress = await Location.reverseGeocodeAsync(currentCoords);
     setAddress(readOnlyAddress[0]);
     console.log(address)
   })();
 }, []);

  const loadBenefits = async() => {
    if(address){
      let state = address.region;
      if(state.length > 2){//state is not abbreviated
      state = convertRegion(address.region, 2);
    }else{
      setErrorMsg('There is a problem with location services. Try again.');
    }
    console.log(state);
      const url = `${CONFIG.API_TREE_BENEFIT}?`
      + `key=${CONFIG.ITREE_KEY}&`
      + `NationFullName=${address.country}&`
      + `StateAbbr=${state}&`
      + `CountyName=${address.subregion}&`
      + `CityName=${address.city}&`
      + `Species=${speciesData.ITREECODE}&`
      + `DBHInch=${dbh}&`
      + `condition=${treeConditionCategory}&`
      + `CLE=${crownLightExposureCategory}&`
      + `TreeHeightMeter=-1&`
      + `TreeCrownWidthMeter=-1&`
      + `TreeCrownHeightMeter=-1&`;

      const response = await axios.get(url);
      if (response.data) {
        const formattedResponse: string = xml2json(response.data, {compact: true, spaces: 2});
        const root: RootObject = xml2js(response.data, {compact: true}) as RootObject;
        if (root) {
          setBenefits(root.Result.OutputInformation.Benefit);
          setFormattedResponse(formattedResponse);
          setIsModalVisible(true);
        }else{
          console.log("error with submittion ")
        }
      }
    }else{
      constol.log("waiting on position")
    }
    }


  const getBenefit = (benefitName: string) => {
    if (benefits && benefits.CO2Benefits) {
        let stringValue = ""
        let unit = ""
        switch (benefitName) {
          case "CORemoved": {
            stringValue = benefits.AirQualityBenefit.CORemovedValue._text;
            unit = benefits.AirQualityBenefit.CORemovedValue._attributes.Unit;
            break;
          }
          case "CO2Sequestered": {
            stringValue = benefits.CO2Benefits.CO2Sequestered._text;
            unit = "lbs";
            break;
          }
          case "CO2SequesteredValue": {
            stringValue = benefits.CO2Benefits.CO2SequesteredValue._text;
            unit = benefits.CO2Benefits.CO2SequesteredValue._attributes.Unit;
            break;
          }
          case "RunoffAvoided": {
            stringValue = benefits.HydroBenefit.RunoffAvoided._text;
            const cubic = parseFloat(stringValue);
            const gallons = cubic * CUBIC_GALLONS_FACTOR;
            unit = "gal";
            return(`${gallons.toFixed(2)} ${unit}`);
            break;
          }
          case "RunoffAvoidedValue": {
            stringValue = benefits.HydroBenefit.RunoffAvoidedValue._text;
            unit = benefits.HydroBenefit.RunoffAvoidedValue._attributes.Unit;
            break;
          }
        }
        const decimal = parseFloat(stringValue);
        const isUnitPrefix = (unit === "$")
        let display =  `${decimal.toFixed(2)} ${unit}`;
        if (isUnitPrefix) {
          display =  `${unit}${decimal.toFixed(2)}`;
        }
        return display;
    }
  }

  return (
<>
      <Button
        mode="outlined"
        onPress={loadBenefits}
        disabled={!canCalculateBenefits}
        icon="calculator"
      >
        Calculate Tree Benefits
      </Button>

      {!!speciesData && benefits && (
        <Modal
          visible={isModalVisible}
          animationType="slide"
          onDismiss={() => {
            setIsModalVisible(false)
          }}
        >
          <StatusBar />

          <View
            style={{
              flex: 1,
              backgroundColor: '#fff',
            }}
          >
            <ScrollView style={{ marginTop: 10 }}>
              <View style={{ flex: 1, paddingHorizontal: 15 }}>
                <Headline>Calculated Tree Benefits</Headline>
                <Text>
                  {speciesData.COMMON} ({speciesData.SCIENTIFIC})
                </Text>

                <Banner visible actions={[]} style={{ marginTop: 15, backgroundColor: '#F0FFF4' }}>
                  Tree Benefits are calculated using the 'iTree API' with permission from the USDA US Forest Service.
                </Banner>
              </View>

              <View>
              <View style={[styles.tableRow, styles.tableRowHeader]}>
                  <View style={styles.tableCell}>
                    <Text style={styles.headerTitleStyle}>Carbon Dioxide (CO²) Sequestered Value</Text>
                  </View>
                  <View style={styles.tableCellRight}>
                    <Text style={styles.headerTitleStyle}>
                      {getBenefit("CO2SequesteredValue")}
                    </Text>
                  </View>
                </View>

                <View style={[styles.tableRow, styles.tableRowHeader]}>
                  <View style={styles.tableCell}>
                    <Text style={styles.headerTitleStyle}>Carbon Dioxide (CO²) Sequestered</Text>
                  </View>
                  <View style={styles.tableCellRight}>
                    <Text style={styles.headerTitleStyle}>
                      {getBenefit("CO2Sequestered")}
                    </Text>
                  </View>
                </View>

                <View style={[styles.tableRow, styles.tableRowHeader]}>
                  <View style={styles.tableCell}>
                    <Text style={styles.headerTitleStyle}>Storm Water Runoff Avoided Value</Text>
                  </View>
                  <View style={styles.tableCellRight}>
                    <Text style={styles.headerTitleStyle}>
                      {getBenefit("RunoffAvoidedValue")}
                    </Text>
                  </View>
                </View>

                <View style={[styles.tableRow, styles.tableRowHeader]}>
                  <View style={styles.tableCell}>
                    <Text style={styles.headerTitleStyle}>Storm Water Runoff Avoided Volume</Text>
                  </View>
                  <View style={styles.tableCellRight}>
                    <Text style={styles.headerTitleStyle}>
                      {getBenefit("RunoffAvoided")}
                    </Text>
                  </View>
                </View>

              </View>

            </ScrollView>

            <Button
              mode="contained"
              style={{ borderRadius: 0 }}
              onPress={() => {
                setIsModalVisible(false)
              }}
            >
              Done
            </Button>
          </View>
        </Modal>
      )}
    </>
  )
}
