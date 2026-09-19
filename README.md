# Cortical Stimulation tool for Clinical use

## Usage
- [ ] describe usage

---
# TODOs

## New features
- [x] multiple observed effects
- [x] New electrode should show on top of the list
- [ ] Multiple possible electrode configuration
    - [ ] Configure new electrode configuration options globally
    - [ ] Assign configuration to all electrodes
    - [ ] Set different configuration per electrode
- [ ] Retrospective mode :
    - [ ] New mode selection screen (first page) : "new session" = existing behavior; "retrospective" = new mode
    - [ ] No requirement to select stimulation time
    - [ ] Add task option "task unknown" above "no task used"
- [ ] Editable after the fact
    - [ ] In summary table, edit button that brings back to stimulation tab with selected stimulation in "view" mode
    - [ ] Stimulation tab in view mode for given stimulation : add option to edit + update instead of "save"
- [ ] Add option in summary table to delete stimulation
- [ ] Stimulation tab : option to enlarge contact selection when none is selected (take up entire width and larger height (all - bar)). Takes back original size when contact is selected. Button to enlarge is small in a corner of the section.

## Refactor
- [ ] Define domain objects with methods
- [ ] Use state management framework instead of relying on form data : zustand or mobx
- [ ] Add domain logic tests !!
- [ ] Add ui tests


## UI refactor
- [ ] Think about UI redesign
- [ ] Switch from mantine to tailwind ?