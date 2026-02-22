/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MaestrosDTO } from '../models/MaestrosDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ExtraService {
    /**
     * Get Maestros
     * @returns MaestrosDTO Successful Response
     * @throws ApiError
     */
    public static getMaestrosMaestrosGet(): CancelablePromise<MaestrosDTO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/maestros',
        });
    }
    /**
     * Get Planificacion Entradas
     * @returns string Successful Response
     * @throws ApiError
     */
    public static getPlanificacionEntradasPlanificacionEntradasGet(): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/planificacion-entradas',
        });
    }
}
