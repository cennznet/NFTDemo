import { Observable } from 'rxjs';
import { ApiInterfaceRx } from '@cennznet/api/types';
/**
 * Get the balance of tokens in a given collection held by an address
 *
 * @param collection  The collection Id
 * @param address The address to query ownership
 *
 *  @returns the count of owned tokens in the collection
 */
export declare function balanceOf(instanceId: string, api: ApiInterfaceRx): (collection: string, address: string) => Observable<number>;
