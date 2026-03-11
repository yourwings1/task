/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TaskDto } from '../models/TaskDto';
import type { TypeTask } from '../models/TypeTask';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TaskService {
    /**
     * @returns TaskDto OK
     * @throws ApiError
     */
    public static getApiTask({
        title,
        description,
        status,
        taskExecutorName,
        createdDateStart,
        createdDateFinish,
        updatedDateStart,
        updatedDateFinish,
        authorName,
        typeSourceTask,
    }: {
        title?: string,
        description?: string,
        status?: string,
        taskExecutorName?: string,
        createdDateStart?: string,
        createdDateFinish?: string,
        updatedDateStart?: string,
        updatedDateFinish?: string,
        authorName?: string,
        typeSourceTask?: TypeTask,
    }): CancelablePromise<Array<TaskDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Task',
            query: {
                'Title': title,
                'Description': description,
                'Status': status,
                'TaskExecutorName': taskExecutorName,
                'CreatedDateStart': createdDateStart,
                'CreatedDateFinish': createdDateFinish,
                'UpdatedDateStart': updatedDateStart,
                'UpdatedDateFinish': updatedDateFinish,
                'AuthorName': authorName,
                'TypeSourceTask': typeSourceTask,
            },
        });
    }
    /**
     * @returns TaskDto OK
     * @throws ApiError
     */
    public static getApiTask1({
        id,
    }: {
        id: string,
    }): CancelablePromise<TaskDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Task/{id}',
            path: {
                'id': id,
            },
        });
    }
}
