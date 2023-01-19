/*******************************************************************************
 * Copyright (C) 2021-2022 University of Macedonia
 * 
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 * 
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

 export const BackendService = Symbol('BackendService');
 export const BACKEND_PATH = '/services/backend';
 
 export interface BackendService {
    getEnvironmentVariable(): Promise<string>;
 }
