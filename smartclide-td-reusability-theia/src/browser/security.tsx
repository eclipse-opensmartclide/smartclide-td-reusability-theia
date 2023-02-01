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

    /**
     * Security Analysis Endpoint
     * @param messageService 
     */
    runprocessAnalyzeSecurity(messageService: MessageService){
        messageService.info('Security analysis started');
        //Wait animation start
		(document.getElementById("waitAnimationSecurity") as HTMLElement).style.display = "block";

        //Get language
        var languageFromSelect = (document.getElementById("select-security-language") as HTMLSelectElement).value;
        var language= '';
        if(languageFromSelect=='java'){
            language= 'Maven';
        }
        else if(languageFromSelect=='python'){
            language= 'Python';
        }
        else if(languageFromSelect=='javascript'){
            language= 'Javascript';
        }

        //body in post
         var dataManual={"CK":{"lcom":[0,0.10910936800871021,3.1849529780564267],"cbo":[0.017050298380221656,0.03692993475020107,0.5714285714285714],
                "wmc":[0.13793103448275863,0.04986595433654195,0.2765273311897106]},"PMD":{"ExceptionHandling":[0,0.22938518010164353,12.987012987012987],
                "Assignment":[0,0.11160028050045479,7.6923076923076929],"Logging":[0,0.05692917472098835,6.8493150684931509],
                "NullPointer":[0,0.32358608981534067,25.966183574879229],"ResourceHandling":[0,2.201831659093579,166.66666666666667],
                "MisusedFunctionality":[0,0.13732179935769163,4.784688995215311]},"Characteristics":{
                "Confidentiality":[0.005,0.005,0.005,0.1,0.1,0.1,0.01,0.01,0.01,0.1,0.1,0.005,0.2,0.15,0.1],
                    "Integrity":[0.01,0.005,0.005,0.1,0.15,0.01,0.01,0.01,0.01,0.15,0.15,0.01,0.16,0.21,0.01],
                    "Availability":[0.005,0.005,0.01,0.1,0.01,0.01,0.2,0.3,0.01,0.01,0.01,0.3,0.01,0.01,0.01]},
                    "metricKeys":{"vulnerabilities":[0,0.09848484848484848,4]},"Sonarqube":{"sql-injection":[0,0.013234192551328933,1.5479876160990714],
                    "dos":[0,0.024419175132769336,2.2172949002217297],"weak-cryptography":[0,0.0015070136414874827,0.1989258006763477],
                    "auth":[0,0.024207864640426639,3.0959752321981428],"insecure-conf":[0,0.7356100591012389,32.05128205128205]}};
        
        //Send Post request
        (async () => {
            try {
                const response = await fetch(SmartclideTdReusabilityTheiaWidget.state.BackEndHost+
                    '/security/analyze?url=' +SmartclideTdReusabilityTheiaWidget.state.SecurityProjectURL+ '&language='+language, 
                    { method: 'post',
                    headers: {
                        'Accept': '*/*',
                        'Authorization': 'Bearer ' + SmartclideTdReusabilityTheiaWidget.state.stateKeycloakToken,
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type':  'application/json'
                    },
                    body: JSON.stringify(dataManual)
                });
                var body = await response.json();
                var obj= JSON.parse(JSON.stringify(body));
                console.log("Endpoint alalysis finished");

                //remove previous
                (document.getElementById('metricsSecurity') as HTMLElement).innerHTML= "";
                let metricsSecurityDiv = document.getElementById('metricsSecurity')!


                //Security_index
                let p_Security_index = document.createElement("p");
                p_Security_index.appendChild(document.createTextNode("Security index: "+(obj.Security_index["Security_Index"]).toFixed(2)));
                metricsSecurityDiv.appendChild(p_Security_index);


                //SonarQube
                let divSonarQubeCategory = document.createElement("div");
				divSonarQubeCategory.className = 'divMetricsCategorySecurity';

                let nodeComponentCategoryName = document.createElement("i");
				nodeComponentCategoryName.appendChild(document.createTextNode("Sonarqube"));

                let nodeComponentList = document.createElement("ul");
                nodeComponentList.className = 'ulSecurityMetrics';
                if(language=='Javascript' || language=='Maven'){
                    let nodeComponentListItem1 = document.createElement("li");
                    nodeComponentListItem1.appendChild(document.createTextNode('insecure-conf: '+(obj.Sonarqube["insecure-conf"]).toFixed(2)));
                    nodeComponentList.appendChild(nodeComponentListItem1);
                    let nodeComponentListItem2 = document.createElement("li");
                    nodeComponentListItem2.appendChild(document.createTextNode('auth: '+(obj.Sonarqube["auth"]).toFixed(2)));
                    nodeComponentList.appendChild(nodeComponentListItem2);
                }
                let nodeComponentListItem3 = document.createElement("li");
                nodeComponentListItem3.appendChild(document.createTextNode('weak-cryptography: '+(obj.Sonarqube["weak-cryptography"]).toFixed(2)));
                nodeComponentList.appendChild(nodeComponentListItem3);
                let nodeComponentListItem4 = document.createElement("li");
                nodeComponentListItem4.appendChild(document.createTextNode('dos: '+(obj.Sonarqube["dos"]).toFixed(2)));
                nodeComponentList.appendChild(nodeComponentListItem4);
                let nodeComponentListItem5 = document.createElement("li");
                nodeComponentListItem5.appendChild(document.createTextNode('sql-injection: '+(obj.Sonarqube["sql-injection"]).toFixed(2)));
                nodeComponentList.appendChild(nodeComponentListItem5);

                divSonarQubeCategory.appendChild(nodeComponentCategoryName);
                divSonarQubeCategory.appendChild(nodeComponentList);

                metricsSecurityDiv.appendChild(divSonarQubeCategory);


                //Property_Scores
                let divPropertyScoresCategory = document.createElement("div");
				divPropertyScoresCategory.className = 'divMetricsCategorySecurity';

                let nodeComponentCategoryName2 = document.createElement("i");
				nodeComponentCategoryName2.appendChild(document.createTextNode("Property_Scores"));

                let nodeComponentList2 = document.createElement("ul");
                nodeComponentList2.className = 'ulSecurityMetrics';
                if(language=='Javascript' || language=='Maven'){
                    let nodeComponentListItem1 = document.createElement("li");
                    nodeComponentListItem1.appendChild(document.createTextNode('insecure-conf: '+(obj.Property_Scores["insecure-conf"]).toFixed(2)));
                    nodeComponentList2.appendChild(nodeComponentListItem1);
                    let nodeComponentListItem2 = document.createElement("li");
                    nodeComponentListItem2.appendChild(document.createTextNode('auth: '+(obj.Property_Scores["auth"]).toFixed(2)));
                    nodeComponentList2.appendChild(nodeComponentListItem2);
                }
                let nodeComponentListItem6 = document.createElement("li");
                nodeComponentListItem6.appendChild(document.createTextNode('weak-cryptography: '+(obj.Property_Scores["weak-cryptography"]).toFixed(2)));
                nodeComponentList2.appendChild(nodeComponentListItem6);
                let nodeComponentListItem7 = document.createElement("li");
                nodeComponentListItem7.appendChild(document.createTextNode('dos: '+(obj.Property_Scores["dos"]).toFixed(2)));
                nodeComponentList2.appendChild(nodeComponentListItem7);
                let nodeComponentListItem8 = document.createElement("li");
                nodeComponentListItem8.appendChild(document.createTextNode('sql-injection: '+(obj.Property_Scores["sql-injection"]).toFixed(2)));
                nodeComponentList2.appendChild(nodeComponentListItem8);
                if(language=='Maven'){
                    let nodeComponentListItem9 = document.createElement("li");
                    nodeComponentListItem9.appendChild(document.createTextNode('Logging: '+(obj.Property_Scores["Logging"]).toFixed(2)));
                    nodeComponentList2.appendChild(nodeComponentListItem9);
                    let nodeComponentListItem10 = document.createElement("li");
                    nodeComponentListItem10.appendChild(document.createTextNode('NullPointer: '+(obj.Property_Scores["NullPointer"]).toFixed(2)));
                    nodeComponentList2.appendChild(nodeComponentListItem10);
                    let nodeComponentListItem11 = document.createElement("li");
                    nodeComponentListItem11.appendChild(document.createTextNode('MisusedFunctionality: '+(obj.Property_Scores["MisusedFunctionality"]).toFixed(2)));
                    nodeComponentList2.appendChild(nodeComponentListItem11);
                    let nodeComponentListItem12 = document.createElement("li");
                    nodeComponentListItem12.appendChild(document.createTextNode('lcom: '+(obj.Property_Scores["lcom"]).toFixed(2)));
                    nodeComponentList2.appendChild(nodeComponentListItem12);
                    let nodeComponentListItem13 = document.createElement("li");
                    nodeComponentListItem13.appendChild(document.createTextNode('ExceptionHandling: '+(obj.Property_Scores["ExceptionHandling"]).toFixed(2)));
                    nodeComponentList2.appendChild(nodeComponentListItem13);
                    let nodeComponentListItem14 = document.createElement("li");
                    nodeComponentListItem14.appendChild(document.createTextNode('wmc: '+(obj.Property_Scores["wmc"]).toFixed(2)));
                    nodeComponentList2.appendChild(nodeComponentListItem14);
                    let nodeComponentListItem15 = document.createElement("li");
                    nodeComponentListItem15.appendChild(document.createTextNode('Assignment: '+(obj.Property_Scores["Assignment"]).toFixed(2)));
                    nodeComponentList2.appendChild(nodeComponentListItem15);
                    let nodeComponentListItem16 = document.createElement("li");
                    nodeComponentListItem16.appendChild(document.createTextNode('cbo: '+(obj.Property_Scores["cbo"]).toFixed(2)));
                    nodeComponentList2.appendChild(nodeComponentListItem16);
                    let nodeComponentListItem17 = document.createElement("li");
                    nodeComponentListItem17.appendChild(document.createTextNode('ResourceHandling: '+(obj.Property_Scores["ResourceHandling"]).toFixed(2)));
                    nodeComponentList2.appendChild(nodeComponentListItem17);
                }
            
                divPropertyScoresCategory.appendChild(nodeComponentCategoryName2);
                divPropertyScoresCategory.appendChild(nodeComponentList2);

                metricsSecurityDiv.appendChild(divSonarQubeCategory);


                //metrics
                let divmetricsCategory = document.createElement("div");
				divmetricsCategory.className = 'divMetricsCategorySecurity';

                let nodeComponentCategoryName3 = document.createElement("i");
				nodeComponentCategoryName3.appendChild(document.createTextNode("metrics"));

                let nodeComponentList3 = document.createElement("ul");
                nodeComponentList3.className = 'ulSecurityMetrics';
                let nodeComponentListItem18 = document.createElement("li");
                nodeComponentListItem18.appendChild(document.createTextNode('ncloc: '+(obj.metrics["ncloc"]).toFixed(2)));
                nodeComponentList3.appendChild(nodeComponentListItem18);
                let nodeComponentListItem19 = document.createElement("li");
                nodeComponentListItem19.appendChild(document.createTextNode('vulnerabilities: '+(obj.metrics["vulnerabilities"]).toFixed(2)));
                nodeComponentList3.appendChild(nodeComponentListItem19);

                divmetricsCategory.appendChild(nodeComponentCategoryName3);
                divmetricsCategory.appendChild(nodeComponentList3);

                metricsSecurityDiv.appendChild(divmetricsCategory);


                //Characteristic_Scores
                let divCharacteristic_ScoresCategory = document.createElement("div");
				divCharacteristic_ScoresCategory.className = 'divMetricsCategorySecurity';

                let nodeComponentCategoryName4 = document.createElement("i");
				nodeComponentCategoryName4.appendChild(document.createTextNode("Characteristic_Scores"));

                let nodeComponentList4 = document.createElement("ul");
                nodeComponentList4.className = 'ulSecurityMetrics';
                let nodeComponentListItem20 = document.createElement("li");
                nodeComponentListItem20.appendChild(document.createTextNode('Availability: '+(obj.Characteristic_Scores["Availability"]).toFixed(2)));
                nodeComponentList4.appendChild(nodeComponentListItem20);
                let nodeComponentListItem21 = document.createElement("li");
                nodeComponentListItem21.appendChild(document.createTextNode('Confidentiality: '+(obj.Characteristic_Scores["Confidentiality"]).toFixed(2)));
                nodeComponentList4.appendChild(nodeComponentListItem21);
                let nodeComponentListItem22 = document.createElement("li");
                nodeComponentListItem22.appendChild(document.createTextNode('Integrity: '+(obj.Characteristic_Scores["Integrity"]).toFixed(2)));
                nodeComponentList4.appendChild(nodeComponentListItem22);

                divCharacteristic_ScoresCategory.appendChild(nodeComponentCategoryName4);
                divCharacteristic_ScoresCategory.appendChild(nodeComponentList4);

                metricsSecurityDiv.appendChild(divCharacteristic_ScoresCategory);

                
                if(language=='Maven'){
                    //CK
                    let divCKCategory = document.createElement("div");
                    divCKCategory.className = 'divMetricsCategorySecurity';

                    let nodeComponentCategoryName5 = document.createElement("i");
                    nodeComponentCategoryName5.appendChild(document.createTextNode("CK"));

                    let nodeComponentList5 = document.createElement("ul");
                    nodeComponentList5.className = 'ulSecurityMetrics';
                    let nodeComponentListItem23 = document.createElement("li");
                    nodeComponentListItem23.appendChild(document.createTextNode('loc: '+(obj.CK["loc"]).toFixed(2)));
                    nodeComponentList5.appendChild(nodeComponentListItem23);
                    let nodeComponentListItem24 = document.createElement("li");
                    nodeComponentListItem24.appendChild(document.createTextNode('cbo: '+(obj.CK["cbo"]).toFixed(2)));
                    nodeComponentList5.appendChild(nodeComponentListItem24);
                    let nodeComponentListItem25 = document.createElement("li");
                    nodeComponentListItem25.appendChild(document.createTextNode('lcom: '+(obj.CK["lcom"]).toFixed(2)));
                    nodeComponentList5.appendChild(nodeComponentListItem25);
                    let nodeComponentListItem26 = document.createElement("li");
                    nodeComponentListItem26.appendChild(document.createTextNode('wmc: '+(obj.CK["wmc"]).toFixed(2)));
                    nodeComponentList5.appendChild(nodeComponentListItem26);

                    divCKCategory.appendChild(nodeComponentCategoryName5);
                    divCKCategory.appendChild(nodeComponentList5);

                    metricsSecurityDiv.appendChild(divCKCategory);


                    //PMD
                    let divPMDCategory = document.createElement("div");
                    divPMDCategory.className = 'divMetricsCategorySecurity';

                    let nodeComponentCategoryName6 = document.createElement("i");
                    nodeComponentCategoryName6.appendChild(document.createTextNode("PMD"));

                    let nodeComponentList6 = document.createElement("ul");
                    nodeComponentList6.className = 'ulSecurityMetrics';
                    let nodeComponentListItem27 = document.createElement("li");
                    nodeComponentListItem27.appendChild(document.createTextNode('Assignment: '+(obj.PMD["Assignment"]).toFixed(2)));
                    nodeComponentList6.appendChild(nodeComponentListItem27);
                    let nodeComponentListItem28 = document.createElement("li");
                    nodeComponentListItem28.appendChild(document.createTextNode('Logging: '+(obj.PMD["Logging"]).toFixed(2)));
                    nodeComponentList6.appendChild(nodeComponentListItem28);
                    let nodeComponentListItem29 = document.createElement("li");
                    nodeComponentListItem29.appendChild(document.createTextNode('NullPointer: '+(obj.PMD["NullPointer"]).toFixed(2)));
                    nodeComponentList6.appendChild(nodeComponentListItem29);
                    let nodeComponentListItem30 = document.createElement("li");
                    nodeComponentListItem30.appendChild(document.createTextNode('MisusedFunctionality: '+(obj.PMD["MisusedFunctionality"]).toFixed(2)));
                    nodeComponentList6.appendChild(nodeComponentListItem30);
                    let nodeComponentListItem31 = document.createElement("li");
                    nodeComponentListItem31.appendChild(document.createTextNode('ResourceHandling: '+(obj.PMD["ResourceHandling"]).toFixed(2)));
                    nodeComponentList6.appendChild(nodeComponentListItem31);
                    let nodeComponentListItem32 = document.createElement("li");
                    nodeComponentListItem32.appendChild(document.createTextNode('ExceptionHandling: '+(obj.PMD["ExceptionHandling"]).toFixed(2)));
                    nodeComponentList6.appendChild(nodeComponentListItem32);

                    divPMDCategory.appendChild(nodeComponentCategoryName6);
                    divPMDCategory.appendChild(nodeComponentList6);

                    metricsSecurityDiv.appendChild(divPMDCategory);
                }
                

                //Security Issues
                //Show button
                (document.getElementById("listofSecurityIssues") as HTMLElement).style.display = 'block';

                //remove previous
                (document.getElementById('listofSecurityIssues') as HTMLElement).innerHTML= "";
                let issuesSecurityDiv = document.getElementById('listofSecurityIssues')!

                //Create list of issues
                if(obj.Hotspots["weak-cryptography"]!=undefined){
                    if(obj.Hotspots["weak-cryptography"].length>0){
                        this.createIssue(obj, issuesSecurityDiv, "weak-cryptography");
                    }
                }
                if(obj.Hotspots["dos"]!=undefined){
                    if(obj.Hotspots["dos"].length>0){
                        this.createIssue(obj, issuesSecurityDiv, "dos");
                    }
                }
                if(obj.Hotspots["insecure-conf"]!=undefined){
                    if(obj.Hotspots["insecure-conf"].length>0){
                        this.createIssue(obj, issuesSecurityDiv, "insecure-conf");
                    }
                }

                (document.getElementById("waitAnimationSecurity") as HTMLElement).style.display = "none";
                messageService.info('Security analysis finished');
            } catch(e) {
                (document.getElementById("waitAnimationSecurity") as HTMLElement).style.display = "none";
                console.log('err: ', e);
            }
        })()
    }

    /**
     * Create list issues for the given category
     * @param obj 
     * @param issuesSecurityDiv 
     * @param categoryName 
     */
    createIssue(obj:any, issuesSecurityDiv: HTMLElement, categoryName:string){
        let nodeCategory = document.createElement("p");
        nodeCategory.appendChild(document.createTextNode(categoryName.replace("-"," ")));
        nodeCategory.style.fontStyle="italic";
        nodeCategory.style.fontWeight="600";
        issuesSecurityDiv.appendChild(nodeCategory);

        for(let i of obj.Hotspots[categoryName]){
            var severity= i.vulnerabilityProbability;
            var message= i.message;
            var re = /(.*)[:]/;
            var component= i.component.replace(re, "");
            var line = i.line;
            
            let divIssue = document.createElement("div");
            divIssue.className = 'divIssue';
            
            let nodeComponent = document.createElement("i");
            nodeComponent.appendChild(document.createTextNode(component+"\xa0\xa0\xa0L:"+line));
            let nodeSeverity = document.createElement("span");
            nodeSeverity.appendChild(document.createTextNode(severity));
            let nodeMessage = document.createElement("p");
            nodeMessage.appendChild(document.createTextNode(message));
            
            divIssue.appendChild(nodeComponent);
            divIssue.appendChild(nodeSeverity);
            divIssue.appendChild(nodeMessage);
            issuesSecurityDiv.appendChild(divIssue);
        }
    }


    /**
     * Vulnerability Assessment Endpoint
     * @param messageService 
     */
	runprocessVulnerabilityAssessmentSecurity(messageService: MessageService){
        messageService.info('Security analysis started');
        //Wait animation start
		(document.getElementById("waitAnimationSecurity") as HTMLElement).style.display = "block";

        //Get language
        var language = (document.getElementById("select-security-language") as HTMLSelectElement).value;

		//Get
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
            
            //waiting animation stop
            (document.getElementById("waitAnimationSecurity") as HTMLElement).style.display = "none";
            messageService.info('Security analysis finished');
        })
        .catch(err => { 
            (document.getElementById("waitAnimationSecurity") as HTMLElement).style.display = "none";
            (document.getElementById("indexSecurity") as HTMLElement).style.display = "none";
            messageService.info('Error: '+err);
            console.log('err: ', err);
        });
	}


    /**
     * Chart for the persentage of vulnerable files
     * @param vulnerable 
     * @param nonVulnerable 
     */
    createChart(vulnerable:number, nonVulnerable:number){
        (document.getElementById("chartSecurity") as HTMLElement).style.display = 'block';
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

    /**
     * Show or Hide Security Issues
     * @param messageService 
     */
    showhideIssues(messageService: MessageService): void {
        var buttonText = (document.getElementById("show-hide-security-issues") as HTMLElement).innerHTML;
        if(buttonText=='Hide Issues'){
            (document.getElementById("show-hide-security-issues") as HTMLElement).innerHTML = 'Show Issues';
            (document.getElementById("listofSecurityIssues") as HTMLElement).style.display = 'none';
        }
        else{
            (document.getElementById("show-hide-security-issues") as HTMLElement).innerHTML = 'Hide Issues';
            (document.getElementById("listofSecurityIssues") as HTMLElement).style.display = 'block';
        }
	}
 }