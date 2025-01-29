import './controlUtils.css';
import { Tooltip } from "react-tooltip";

export const getDpwhTooltipMessage = () => {
    let ret = {
        title: `💡 INFORMATION`,
        body: "Data is sourced from the publicly accessible DPWH Infrastructure Projects website, analyzed offline, and transformed into JSON format. No hacking or any malicious activity performed on the DPWH website. Accessing this webpage does not interact with the DPWH website. This page only loads the prepared JSON file mentioned earlier."
    };
    return JSON.stringify(ret);
}

export const getCategoryTooltipMessage = () => {
    let ret = {
        title: `⚠️ EXPERIMENTAL FEATURE`,
        body: "Categories are not provided on the DPWH website and are assigned based on the developer's algorithm/judgment. Misclassified or uncategorized items can be reported to the developer."
    };
    return JSON.stringify(ret);
}

export const getShortCategoryTooltipMessage = () => {
    let ret = {
        title: `⚠️ Experimental Feature`,
        body: ""
    };
    return JSON.stringify(ret);
}

export const getDistrictTooltipMessage = () => {
    let ret = {
        title: `💡 NOTE`,
        body: "The DPWH District Engineering Office is not directly correlated with Congressional Districts. There are 254 Congressional Districts in the 20th Congress, while there are only 210 DPWH DEO's."
    };
    return JSON.stringify(ret);
}

export const getProjectTooltipMessage = () => {
    let ret = {
        title: `💡 NOTE`,
        body: "Exact phrase search only for now. Search is case-insensitive (e.g. ROAD, road & Road are all the same). Hoping to be able to implement fuzzy/ wildcard search next time"
    };
    return JSON.stringify(ret);
}

export const getContractorCostTooltipMessage = () => {
    let ret = {
        title: `💡 NOTE`,
        body: "A contract may involve multiple contractors. This cost represents the total for all contracts the contractor is involved with, without a breakdown by individual contractor."
    };
    return JSON.stringify(ret);
}

export const getContractorFilterTooltipMessage = () => {
    let ret = {
        title: `💡 NOTE`,
        body: "If a contractor filter is applied, you may see other contractors listed, whom the filtered contractor(s) collaborated with on multi-contractor contracts."
    };
    return JSON.stringify(ret);
}

export const categoryLabelMap = {
    bridge: 'bridge construction, widening, maintenance, etc',
    building: 'office buildings, city halls, brgy halls, public markets, municipal halls etc',
    'cruise port': 'cruise ports',
    'davao bypass': 'davao bypass road project (one of the biggest infra projects)',
    'flood': 'pumping stations, revetment, river/shore protection, guardwall, culvert, retention basin etc',
    footbridge: 'pedestrian foot bridges',
    light: 'street lights, stud lights',
    multi: 'multi-purpose halls/bldgs, sports complex, gyms, convention center, evacuation center',
    'police+military': 'police stations/HQ/multipurpose bldg, police academy, military camps, intelligence services/school',
    'river+dike+creek': 'river, dike and creek programs that do not have flood control technical keywords',
    road: 'roads, highways, expressways, coastal roads, causeways, avenues, right-of-way, signages/markings etc (except davao bypass road)',
    'road+bridge': 'projects that involve both roads and bridges',
    school: 'school/university buildings and mulitipurpose halls, classrooms (excluding police academies)',
    uncategorized: 'city jails, airports, seaports, bus terminals, pdea and other projects that are difficult to categorize',
    'overpass+underpass': 'pedestrian overpass/underpass',
    'water supply': 'water supply, sytem, waterworks'
}

export const getCategoryLabel = (cat) => {

}

export const createGenericToolTip = (tooltipId) => {
    return <Tooltip
    id={tooltipId}
    opacity={1}
    clickable={true}
    float={true}
    style={{ background: "black", color: "#fff", zIndex: 99999 }}
    render={({ content }) => {        
        let jsonContent = JSON.parse(content);
        if (!jsonContent) {
            console.log('[GenericToolTip] Render -- NULL', content);
            return "NULL";
        }
        let {title, body} = jsonContent;

        return <div className="tooltip-generic-container">
            <div className="tooltip-generic-title">{title}</div>
            <div className="tooltip-generic-body">{body}</div>
        </div>
    }}
      
  />
}