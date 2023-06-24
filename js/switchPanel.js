const handleSwitchPanelButtonClick = (event) => {
    const button = event.target;
    const buttonSlotA = document.getElementById('sw-slot-a');
    buttonSlotA.classList.toggle('switch-panel-button-hidden');
    const buttonSlotB = document.getElementById('sw-slot-b');
    buttonSlotB.classList.toggle('switch-panel-button-hidden');


    const panel = document.getElementsByClassName('switch-panel')[0];

    const panelContentA = panel.querySelector('.sw-panel-a');
    panelContentA.classList.toggle('sw-panel-hidden');
    const panelContentB = panel.querySelector('.sw-panel-b');
    panelContentB.classList.toggle('sw-panel-hidden');

    const switchPanelLabelA = document.getElementById('sw-label-a');
    switchPanelLabelA.classList.toggle('switch-panel-label-hidden');
    const switchPanelLabelB = document.getElementById('sw-label-b');
    switchPanelLabelB.classList.toggle('switch-panel-label-hidden');
}