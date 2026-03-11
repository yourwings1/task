/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TaskUpdateChangedDto } from '../models/TaskUpdateChangedDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TaskUpdateService {
    /**
     * @returns TaskUpdateChangedDto OK
     * @throws ApiError
     */
    public static getApiTaskUpdate({
        dateStart,
        dateFinish,
    }: {
        dateStart?: string,
        dateFinish?: string,
    }): CancelablePromise<Array<TaskUpdateChangedDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/TaskUpdate',
            query: {
                'DateStart': dateStart,
                'DateFinish': dateFinish,
            },
        });
    }
}
