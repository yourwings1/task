/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserAuthenticationDto } from '../models/UserAuthenticationDto';
import type { UserRegistrationDto } from '../models/UserRegistrationDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserService {
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static postApiAuthenticate({
        requestBody,
    }: {
        requestBody?: UserAuthenticationDto,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/Authenticate',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static postApiRegistration({
        requestBody,
    }: {
        requestBody?: UserRegistrationDto,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/Registration',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
