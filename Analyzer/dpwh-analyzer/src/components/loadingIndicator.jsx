import { useEffect, useRef } from 'react';
import './loadingIndicator.css';

export const LoadingIndicator = (props) => {        

    const refPageLoader = useRef();

    useEffect(() => {
        if (props.isOverlay) {
            //debugger
            const refTableHeight = props.refTable.current.clientHeight;
            const refLoaderPage = refPageLoader.current;
            refLoaderPage.style.height = `${refTableHeight}px`;
        }
    }, [])

    let classNamesPage = 'loaderPage'
    let classNamesLabel= 'loaderLabel';
    if (props.isOverlay) {
        classNamesPage += ' loader-overlay';
        classNamesLabel += ' loaderLabel-overlay';
    }
    return <div className={classNamesPage} ref={refPageLoader}>
        <div className="loaderContainer">            
            <div className="loader"/>
            <div className={classNamesLabel}>{props.msg || 'Loading...'}</div>            
        </div>
    </div>
}