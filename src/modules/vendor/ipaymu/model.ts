import {t} from "elysia";

export namespace IpaymuVendorModel {
    export const account = t.Object({
        va: t.String(),
        apiKey: t.String(),});

    export type account = typeof account.static;

    
}