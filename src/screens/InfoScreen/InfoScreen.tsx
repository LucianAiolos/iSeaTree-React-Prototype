import React, { useEffect, useState } from 'react'

import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native"
import { TreeInfo } from './TreeInfo'
import { SpeciesData } from '../AddTreeScreen/SpeciesSelect'
import speciesDataList from '../../../data/species.json'
import { MaterialBottomTabNavigationProp } from '@react-navigation/material-bottom-tabs'
import { ButtonTab } from './components/ButtonTab'
import { SearchBar } from './components/SearchBar'
import { TreeCard } from './components/TreeCard'
import { Text } from 'react-native-paper'

type TreeInfoNavigation = MaterialBottomTabNavigationProp<any, 'Profile'>

export function InfoScreen(props: { navigation: TreeInfoNavigation }) {
  const [selectedTree, setSelectedTree] = useState<SpeciesData | undefined>(undefined)
  const [selectedGenus, setSelectedGenus] = useState<SpeciesData | undefined>(undefined)
  const [query, setQuery] = useState<string>('')
  // page 1 list
  const [treeList, setTreeList] = useState<SpeciesData[]>([])
  // page 2 list
  const [filteredSpeciesList, setFilteredSpeciesList] = useState<SpeciesData[]>([])
  const [activeTab, setActiveTab] = useState<string>('Genus')

  // loading the complete list of trees on component mount
  let completeList = []
  useEffect(() => {
    // sort list by common name ascending
    completeList = speciesDataList.sort((a, b) => {
      return a.COMMON.localeCompare(b.COMMON)
    })
    setTreeList(completeList)
  }, [])

  // filters logic
  useEffect(() => {
    let newList: SpeciesData[] = speciesDataList
    if (query) {
      newList = newList.filter(tree => (tree.COMMON.indexOf(query) > -1) || (tree.SCIENTIFIC.indexOf(query) > -1))
    }
    // page 2 is not affected by button tab
    let genusList = newList.filter(tree => tree.COMMON.indexOf('spp') > -1)
    let speciesList = newList.filter(tree => tree.COMMON.indexOf('spp') == -1)
    setTreeList(activeTab == 'Genus' ? genusList : speciesList)
    setFilteredSpeciesList(speciesList)
  }, [query, activeTab]);

  const renderDefaultLayout = () => {
    return <ScrollView>
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
      }}>
        {treeList.map((tree: SpeciesData) =>
          <TreeCard tree={tree} setSelectedTree={setSelectedTree} selectedGenus={selectedGenus} setSelectedGenus={setSelectedGenus} key={tree.COMMON} />)
        }
      </View>
    </ScrollView>
  }

  const renderGenusLayout = () => {
    return <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
      <TouchableOpacity onPress={() => setSelectedGenus(undefined)}>
        {/* @ts-ignore: skip props */}
        <Text>{'RETURN'}</Text>
      </TouchableOpacity>
      {/* @ts-ignore: skip props */}
      <Text>{'--------- Genus ---------'}</Text>
      {selectedGenus && (activeTab != 'Genus') && <TreeCard tree={selectedGenus} setSelectedTree={setSelectedTree} selectedGenus={selectedGenus} setSelectedGenus={setSelectedGenus} />}

      {/* @ts-ignore: skip props */}
      <Text>{'--------- Species ---------'}</Text>
      {selectedGenus && <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
      }}>
        {filteredSpeciesList.filter((tree: SpeciesData) => tree.GENUS == selectedGenus.GENUS).map((tree: SpeciesData) =>
          <TreeCard tree={tree} setSelectedTree={setSelectedTree} selectedGenus={selectedGenus} setSelectedGenus={setSelectedGenus} key={tree.COMMON} />)
        }
      </View>}
    </ScrollView>
  }

  return (
    <KeyboardAvoidingView behavior="height" enabled style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        {selectedTree ? (
          <TreeInfo selectedTree={selectedTree} setSelectedTree={setSelectedTree} navigation={props.navigation} />
        ) : (
          <>
            <View style={{ alignItems: 'center' }}>
              <ButtonTab activeTab={activeTab} setActiveTab={setActiveTab} />
              <SearchBar query={query} setQuery={setQuery} />
            </View>
            {selectedGenus ? renderGenusLayout() : renderDefaultLayout()}
          </>
        )
        }
      </SafeAreaView>
    </KeyboardAvoidingView >
  )
}
