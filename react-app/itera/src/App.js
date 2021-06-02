import logo from './logo.svg';
import './App.css';
import Person from "./Person"
import { useState, useEffect } from 'react';

function App() {

  const [personer, setPersoner] = useState([])

  useEffect(() => {
    const hentPersoner = async () => {
      const res = await fetch("https://randomuser.me/api?results=20")
		  const json = await res.json()
      setPersoner(json.results)
    }
    hentPersoner()
  }, []);

  return (
    <div className="App">
      {personer.map(p => <Person first={p.name.first} title={p.name.title} last={p.name.last} picture={p.picture.large} /> )}
    </div>
  );
}

export default App;
