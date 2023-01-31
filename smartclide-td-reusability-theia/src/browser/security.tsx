/*******************************************************************************
 * Copyright (C) 2021-2022 UoM - University of Macedonia
 * 
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 * 
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

 import { SmartclideTdReusabilityTheiaWidget } from './smartclide-td-reusability-theia-widget';
 import { MessageService } from '@theia/core';
 import * as echarts from 'echarts';

 export class Security {

    myChartSecurity:any;

    //Analyze Security
	runprocessAnalyzeSecurity(messageService: MessageService){
        messageService.info('Security analysis started');
        //Wait animation start
		(document.getElementById("waitAnimation") as HTMLElement).style.display = "block";

        //Get language
        var language = (document.getElementById("select-security-language") as HTMLSelectElement).value;

		//Post
		fetch(SmartclideTdReusabilityTheiaWidget.state.BackEndHost+
            '/security/VulnerabilityAssessment?project='+SmartclideTdReusabilityTheiaWidget.state.SecurityProjectURL+'&lang='+language
                , {
                method: 'get',
                headers: {
                    'Accept': '*/*',
                    'Access-Control-Allow-Origin': '*',
                    'Authorization': 'Bearer ' + SmartclideTdReusabilityTheiaWidget.state.stateKeycloakToken
                }
            })
        .then(res => res.json())
        .then((out) => {
            var obj= JSON.parse(JSON.stringify(out));

            //remove previous
            (document.getElementById('resultsSecurity') as HTMLElement).innerHTML= "";
            (document.getElementById('indexSecurity') as HTMLElement).innerHTML= "";
            (document.getElementById('chartSecurity') as HTMLElement).innerHTML= "";
            
            //parse response
            //crate HTMLElement for each file
            var count=0;
			for(let i of obj.results){
                var confidence= i.confidence;
                var path= i.path.substring(i.path.indexOf("/") + 1);
                path= path.substring(path.indexOf("/") + 1);
                var vulnerable= i.is_vulnerable;
                
                //add the vulnerable files only
                if(vulnerable==1){
                    count= count+1;

                    let issuesDiv = document.getElementById('resultsSecurity')!
					let divIssue = document.createElement("div");
					divIssue.className = 'divFileSecurity';

                    let nodeComponent = document.createElement("i");
					nodeComponent.appendChild(document.createTextNode(path));
					let nodeSeverity = document.createElement("span");
					nodeSeverity.appendChild(document.createTextNode(confidence));

                    divIssue.appendChild(nodeComponent);
					divIssue.appendChild(nodeSeverity);
					issuesDiv.appendChild(divIssue);
                }
            }

            //add the files count 
            let pSecurity = document.getElementById('indexSecurity')!
            if(count>0){
                pSecurity.appendChild(document.createTextNode("The following files have security vulnerabilities"));
                this.createChart(count,obj.results.length);
            }
            else{
                pSecurity.appendChild(document.createTextNode("No vulnerable files found"));
            }
        })
        .catch(err => { 
            (document.getElementById("indexSecurity") as HTMLElement).style.display = "none";
            messageService.info('Error: '+err);
            console.log('err: ', err);
        });
        
		//waiting animation stop
		(document.getElementById("waitAnimation") as HTMLElement).style.display = "none";
	}

    //Chart for the persentage of vulnerable files
    createChart(vulnerable:number, nonVulnerable:number){
        type EChartsOption = echarts.EChartsOption;
		if(this.myChartSecurity !== undefined){
			this.myChartSecurity.dispose();
		}
		var chartDom = document.getElementById("chartSecurity")!;
		this.myChartSecurity = echarts.init(chartDom);
		var option: EChartsOption;

		option = {
            tooltip: {
              trigger: 'item'
            },
            series: [
              {
                type: 'pie',
                radius: ['50%', '80%'],
                avoidLabelOverlap: false,
                label: {
                  show: true,
                  color: 'white'
                },
                emphasis: {
                  label: {
                    show: true,
                    fontSize: 10,
                    fontWeight: 'bold'
                  }
                },
                labelLine: {
                  show: false
                },
                data: [
                  { value: vulnerable, name: 'Vulnerable files' },
                  { value: nonVulnerable, name: 'Safe files' }
                ]
              }
            ]
        };
        
        option && this.myChartSecurity.setOption(option);
    }
 }