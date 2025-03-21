# ABCD-LFP


# File distribution


## Server side

- `config` contains important constant

- `src` folder contain all the source materials for building the project

- `src/core` contain all business logic and domain model directly related to the simulation
    - `domain` contains the domain model (conceptual model represents the entities, attributes, behaviors, and relationship within a problem domain) such as investment type
    - `simulation` the model logic (monte carol simulation)
    - `tax` contain  tax calculation logic (e.g. TaxBrackets Class)

- `src/db` contains database connectivity, model definition and manipulation
    - `models` contains the database layer model (schemas)
    - `connections` connect/disconnect mongodb
    - `respositories` contains module that responsible for interacting with data store

- `src/services` externel service call (e.g. web scraping)
    - `scraping` contain the web scraping logic for federal tax

-  `src/utils` pure tool function (no business logic, no state)
    - `validation.ts` validate data
    - `logging.ts`
    - `math/` contain math model for sampling data
    - `date.ts` format date
