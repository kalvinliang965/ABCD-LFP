export class Scenario {

    constructor(
        public readonly name: string,
        public readonly start_year: number,
        public readonly initial_cash: number,
        public readonly include_spouse: number,
    ){}

    public validate(): void {
        // TODO
    }

}