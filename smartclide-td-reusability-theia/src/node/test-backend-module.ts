/*******************************************************************************
 * Copyright (C) 2021-2022 University of Macedonia
 * 
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 * 
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/
import { ConnectionHandler, JsonRpcConnectionHandler } from "@theia/core";
import { ContainerModule } from "inversify";
import { BackendService, BACKEND_PATH } from "../common/protocol";
import { BackendServiceImpl } from "./hello-backend-service";

export default new ContainerModule(bind => {
    bind(BackendService).to(BackendServiceImpl).inSingletonScope()
    bind(ConnectionHandler).toDynamicValue(ctx =>
        new JsonRpcConnectionHandler(BACKEND_PATH, () => {
            return ctx.container.get<BackendService>(BackendService);
        })
    ).inSingletonScope();
});
