import './App.css';
import JSZip from 'jszip';
import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector} from 'react-redux';
import { setInitialData } from './state/data/dataSlice';
import { LoadingIndicator } from './controls/loadingIndicator';
import { AppHeader} from './components/appHeader';
import { Settings} from './components/settings';
import { TableBase } from './components/table-base';
import {createChartToolTip} from './components/table-base';
import {createGenericToolTip} from './controls/controlUtils';

function App() {
    console.log('App Render...');
    const [finishedLoading, setFinishedLoading] = useState(false);
    const dispatch = useDispatch();

    // Initial loading activities
    useEffect(() => {
    console.log('useEffect...');
    const fetchAndLoadData = async () => {
        console.log('fetchAndLoadData start');
        const fetchResponse = await fetch('./AllContractsCategorized.json.zip');
        if (!fetchResponse.ok) {
            console.error('Unable to fetch contracts data!');
            return;
        }
        const contractsZip = await fetchResponse.arrayBuffer();
        const zip = new JSZip();
        try {
            const unzippedFiles = await zip.loadAsync(contractsZip);
            const contractsFile = unzippedFiles.files['AllContractsCategorized.json'];
            const constractsJson = JSON.parse(await contractsFile.async('string'));
            console.log('Contracts Length', constractsJson.length);
            const masterDataFile = unzippedFiles.files['MasterDataCategorized.json'];
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

    const tableRef = useRef();
    const dataSliceFilterLoadingMsg = useSelector(state => state.dataReducer.FilterLoadingMsg);   

    if (!finishedLoading) {
        return <LoadingIndicator/>;
    }
    
    return (
    <div ref={tableRef}>
        {dataSliceFilterLoadingMsg && <LoadingIndicator isOverlay={true} refTable={tableRef} msg={dataSliceFilterLoadingMsg}/>}
        {createChartToolTip('chart-tooltip')}
        {createGenericToolTip('generic-tooltip')}
        <AppHeader/>
        <Settings/>
        <TableBase/>
    </div>
    )
}

export default App
