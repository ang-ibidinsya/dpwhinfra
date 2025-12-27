import './App.css';
import { unzipSync } from 'fflate';
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
            const startTime = performance.now();
            let unzippedFiles = null, contractsFile = null, masterDataFile = null, constractsJson = null, masterDataJson = null;
            if (true) { // fflate approach; takes about 600ms to finish; replace JSZip with this
                const compressed = new Uint8Array(contractsZip);
                const decompressed = unzipSync(compressed);                
                contractsFile = decompressed['AllContractsCategorized.json'];
                masterDataFile = decompressed['MasterDataCategorized.json'];
                const textDecoder = new TextDecoder();
                masterDataJson = JSON.parse(textDecoder.decode(masterDataFile));
                constractsJson = JSON.parse(textDecoder.decode(contractsFile));
                console.log(`finished loading zip file: ${performance.now() - startTime}ms`);
            }
            /* JSZip approach; takes about 1000ms to finish; removed it
            else {
                const unzippedFiles = await zip.loadAsync(contractsZip);
                contractsFile = unzippedFiles.files['AllContractsCategorized.json'];
                masterDataFile = unzippedFiles.files['MasterDataCategorized.json'];
                constractsJson = JSON.parse(await contractsFile.async('string'));
                masterDataJson = JSON.parse(await masterDataFile.async('string'));
                console.log(`finished loading zip file: ${performance.now() - startTime}ms`);
            }
            */
                                     
            console.log('Contracts Length', constractsJson.length);                        
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
