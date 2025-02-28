import "./appHeader.css";
import {getDpwhTooltipMessage} from '../controls/controlUtils';

export const AppHeader = () => {
    return <div className="appHeader">
        <div className="titleLine topLine">
            <img src="./icon.svg"  className="appIcon"/>
            <span className="mainTitle">List of 176,397 DPWH Infrastructure Projects</span>
            <div className="subtitle">From 2016 to Dec 31, 2024</div>
            <div className="subtitle">&nbsp;&nbsp;
                <span data-tooltip-id='generic-tooltip'
                data-tooltip-content={getDpwhTooltipMessage()}
                style={{cursor: 'pointer'}}
                
                >🌐</span> 
                &nbsp;Source: DPWH Infrastructure Website</div>

        </div>
        <div className="titleLine nextLine">
            
        </div>
    </div>
}