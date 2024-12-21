import './App.css';
import { useEffect, useState } from 'react';
import JSZip from 'jszip';
import { LoadingIndicator } from './components/loadingIndicator';
import {AppHeader} from './components/appHeader';

function App() {
  console.log('App Render...');
  const [finishedLoading, setFinishedLoading] = useState(false);

  useEffect(() => {
    console.log('useEffect...');
    const fetchAndLoadData = async () => {
      console.log('fetchAndLoadData start');
      const fetchResponse = await fetch('./AllContracts.json.zip');
      if (!fetchResponse.ok) {
        console.error('Unable to fetch contracts data!');
        return;
      }
      const contractsZip = await fetchResponse.arrayBuffer();
      const zip = new JSZip();
      try{
        const unzippedFiles = await zip.loadAsync(contractsZip);
        const contractsFile = unzippedFiles.files['AllContracts.json'];
        const constractsJson = JSON.parse(await contractsFile.async('string'));
        console.log('Contracts Length', constractsJson.length);
      }
      catch(ex) {
        console.error('Exception trying to unzip data', ex);
        return;
      }
          
      setFinishedLoading(true);
      console.log('fetchAndLoadData finished');
    }

    fetchAndLoadData();
  }, []) // Run once only when the component mounts

  if (!finishedLoading) {
    return <LoadingIndicator/>;
  }
  return (
    <>
      <AppHeader/>
    </>
  )
}

export default App
