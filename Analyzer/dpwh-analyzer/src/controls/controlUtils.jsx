import './controlUtils.css';
import { Tooltip } from "react-tooltip";

export const getCategoryTooltipMessage = () => {
    let ret = {
        title: `⚠️ Experimental Feature Warning`,
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