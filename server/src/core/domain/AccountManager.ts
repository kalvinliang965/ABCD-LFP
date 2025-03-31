import { Investment } from "./investment/Investment";

export type AccountMap = Map<string, Investment>;

export interface AccountManager {
    readonly non_retirement: AccountMap;
    readonly pre_tax: AccountMap;
    readonly after_tax: AccountMap;
    clone(): AccountManager;
} 

export function create_account_manager(
    non_retirement: AccountMap, 
    pre_tax: AccountMap, 
    after_tax: AccountMap
): AccountManager {
    return {
        non_retirement,
        pre_tax,
        after_tax,
        clone: () => create_account_manager(
            clone_account_map(non_retirement),
            clone_account_map(pre_tax),
            clone_account_map(after_tax)
        )
    }
}

function clone_account_map(map: AccountMap): AccountMap {
    const newMap = new Map<string, Investment>();
    for (const [key, value] of map) {
      newMap.set(key, value.clone());
    }
    return newMap;
}