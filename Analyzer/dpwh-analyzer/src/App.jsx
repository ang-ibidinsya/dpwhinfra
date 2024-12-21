import './App.css';
import JSZip from 'jszip';
import { useEffect, useState } from 'react';
import { useDispatch} from 'react-redux';
import { setInitialData } from './state/data/dataSlice';
import { LoadingIndicator } from './components/loadingIndicator';
import {AppHeader} from './components/appHeader';
import {Settings} from './components/settings';

function App() {
    console.log('App Render...');
    const [finishedLoading, setFinishedLoading] = useState(false);
    const dispatch = useDispatch();

    // Initial loading activities
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
        try {
            const unzippedFiles = await zip.loadAsync(contractsZip);
            const contractsFile = unzippedFiles.files['AllContracts.json'];
            const constractsJson = JSON.parse(await contractsFile.async('string'));
            console.log('Contracts Length', constractsJson.length);
            const masterDataFile = unzippedFiles.files['MasterData.json'];
            const masterDataJson = JSON.parse(await masterDataFile.async('string'));
            dispatch(setInitialData({constractsJson, masterDataJson}));
        }
        catch(ex) {
            console.error('Exception trying to unzip data', ex);
            // TODO: Show error message
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
        <Settings/>
    </>
    )
}

export default App
