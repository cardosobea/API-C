import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import * as SQLite from 'expo-sqlite';


const db = SQLite.openDatabase('beers.db');

const BeerApp = () => {
  const [beers, setBeers] = useState([]);
  const [selectedBeer, setSelectedBeer] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS beers (id INTEGER PRIMARY KEY AUTOINCREMENT, brand TEXT, name TEXT, style TEXT, hop TEXT, yeast TEXT, malts TEXT, ibu TEXT, alcohol TEXT, blg TEXT)'
      );
    });
    retrieveBeers();
  }, []);

  const fetchRandomBeer = async () => {
    try {
      const response = await fetch('https://random-data-api.com/api/beer/random_beer');
      const data = await response.json();
      if (response.ok) {
        saveBeer(data);
        setBeers(prevBeers => [...prevBeers, data]);
      } else {
        setError('Erro ao buscar dados da cerveja');
      }
    } catch (error) {
      setError('Erro ao buscar dados da cerveja');
    }
  };

  const saveBeer = (beer) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO beers (brand, name, style, hop, yeast, malts, ibu, alcohol, blg) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [beer.brand, beer.name, beer.style, beer.hop, beer.yeast, beer.malts, beer.ibu, beer.alcohol, beer.blg]
      );
    });
  };

  const retrieveBeers = () => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM beers', [], (_, { rows }) => {
        setBeers(rows._array);
      });
    });
  };

  const handleBeerSelection = (beer) => {
    setSelectedBeer(beer);
  };

  const renderBeerItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleBeerSelection(item)}>
      <View style={styles.itemContainer}>
        <Text style={styles.itemText}>Brand: {item.brand}</Text>
        <Text style={styles.itemText}>Name: {item.name}</Text>
        <Text style={styles.itemText}>Style: {item.style}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSelectedBeer = () => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>Brand: {selectedBeer.brand}</Text>
      <Text style={styles.itemText}>Name: {selectedBeer.name}</Text>
      <Text style={styles.itemText}>Style: {selectedBeer.style}</Text>
      <Text style={styles.itemText}>Hop: {selectedBeer.hop}</Text>
      <Text style={styles.itemText}>Yeast: {selectedBeer.yeast}</Text>
      <Text style={styles.itemText}>Malts: {selectedBeer.malts}</Text>
      <Text style={styles.itemText}>IBU: {selectedBeer.ibu}</Text>
      <Text style={styles.itemText}>Alcohol: {selectedBeer.alcohol}</Text>
      <Text style={styles.itemText}>BLG: {selectedBeer.blg}</Text>
    </View>
  );

  const clearScreen = () => {
    db.transaction(tx => {
      tx.executeSql('DELETE FROM beers', [], () => {
        setBeers([]);
        setSelectedBeer(null);
        setError(null);
      });
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={fetchRandomBeer}>
        <Text style={styles.buttonText}>Consultar Cerveja</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={clearScreen}>
        <Text style={styles.buttonText}>Limpar Tela</Text>
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={beers}
        renderItem={renderBeerItem}
        keyExtractor={(item) => item.id.toString()}
      />
      {selectedBeer && renderSelectedBeer()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  button: {
    backgroundColor: '#4DA6FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  itemContainer: {
    backgroundColor: '#F0F0F0',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  itemText: {
    marginBottom: 8,
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default BeerApp;