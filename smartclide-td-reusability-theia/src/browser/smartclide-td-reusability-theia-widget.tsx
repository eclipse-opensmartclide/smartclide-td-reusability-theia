/*******************************************************************************
 * Copyright (C) 2021-2022 UoM - University of Macedonia
 * 
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 * 
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import * as React from 'react';
import { injectable, postConstruct, inject } from 'inversify';
import { AlertMessage } from '@theia/core/lib/browser/widgets/alert-message';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { MessageService } from '@theia/core';
import { Interest} from './interest';
import { Principal} from './principal';
import { Reusability} from './reusability';
import {Security} from './security';
//import Chart from './chart';
//import ReactDOM = require('react-dom');
//import ResizeObserver from 'react-resize-observer';
import * as echarts from 'echarts';
import { messageTypes, buildMessage } from '@unparallel/smartclide-frontend-comm';
import { Message } from '@theia/core/lib/browser';
import { BackendService } from '../common/protocol';


@injectable()
export class SmartclideTdReusabilityTheiaWidget extends ReactWidget {

    static readonly ID = 'smartclide-td-reusability-theia:widget';
    static readonly LABEL = 'Smartclide TD and Reusability';
	
	static state = {
		BackEndHost: 'https://api.dev.smartclide.eu',
		PrincipalProjectURL: '',
		InterestProjectURL: '',
		InterestProjectHasToken: '',
		InterestProjectToken: '',
		PrincipalProjectToken: '',
		InterestFileNumber: '',
		ReusabilityProjectURL: '',
		SecurityProjectURL: '',
		stateKeycloakToken: '',
		stateServiceID: ''
	}
	
	static statePrincipalEndpoints=[{fileName: '', endpointMethod: ''}]
	
	static stateInterest ={
		data: [[0, 0]]
	}
	
	static stateReusability ={
		data: [[0, 0]]
	}

	static myChart:any;

	//Handle KEYCLOAK_TOKEN message from parent
	handleTokenInfo = ({data}:any) => {
		switch (data.type) {
		  case messageTypes.KEYCLOAK_TOKEN:
			console.log("td-reusability: RECEIVED", JSON.stringify(data, undefined, 4));
			SmartclideTdReusabilityTheiaWidget.state.stateKeycloakToken = data.content.token;
			break;
		  case messageTypes.COMM_END:
			console.log("td-reusability: RECEIVED", JSON.stringify(data, undefined, 4));
			window.removeEventListener("message", this.handleTokenInfo);
			break;
		  case messageTypes.COMM_START_REPLY:
			console.log("td-reusability: RECEIVED", JSON.stringify(data, undefined, 4));
			SmartclideTdReusabilityTheiaWidget.state.stateKeycloakToken = data.content.token;
			SmartclideTdReusabilityTheiaWidget.state.stateServiceID = data.content.serviceID;
			break;
		  default:
			break;
		}
	}

    @inject(MessageService)
    protected readonly messageService!: MessageService;
	
	@inject(BackendService)
	private readonly backendService: BackendService;

    @postConstruct()
    protected async init(): Promise < void> {
        this.id = SmartclideTdReusabilityTheiaWidget.ID;
        this.title.label = SmartclideTdReusabilityTheiaWidget.LABEL;
        this.title.caption = SmartclideTdReusabilityTheiaWidget.LABEL;
        this.title.closable = true;
        this.title.iconClass = 'fa fa-eur';
        this.update();

		//Add even listener to get the Keycloak Token
		window.addEventListener("message", this.handleTokenInfo);

		//Send a message to inform SmartCLIDE IDE
		let message = buildMessage(messageTypes.COMM_START);
		window.parent.postMessage(message, "*");

		//Get env variable from backend
		var tmp = await this.backendService.getEnvironmentVariable();
		console.log("Log from postConstruct: "+tmp);
    }

	//After Detach Remove Listener
	protected onAfterDetach(msg: Message): void {
		window.removeEventListener("message", this.handleTokenInfo);
		super.onAfterDetach(msg);
	}

    protected render(): React.ReactNode {
        const header = `Provide SonarQube URL instance and get latest results.`;
        const header2 = `Provide git URL and get latest results.`;
        const header3 = `Provide git URL and get results.`;
		const header4 = `Provide git URL and get results.`;
		
		const interestInstance= new Interest();
		const principalInstance= new Principal();
		const reusabilityInstance= new Reusability();
		const securityInstance= new Security();

		/**
		 	<ResizeObserver
				onResize={(rect) => SmartclideTdReusabilityTheiaWidget.resizeChart()}
			/>
		 */
        return <div id='widget-container-TDReusability'>
			
			<ul>
				<li><span id='menuPrincipal' className='active' onClick={_a => this.clickMenu('menuPrincipal','td-principal')}>TD Principal</span></li>
				<li><span id='menuInterest' onClick={_a => this.clickMenu('menuInterest','td-interest')}>TD Interest</span></li>
				<li><span id='menuReusability' onClick={_a => this.clickMenu('menuReusability','reusability')}>Reusability</span></li>
				<li><span id='menuSecurity' onClick={_a => this.clickMenu('menuSecurity','security')}>Security</span></li>
			</ul>
			<div id='td-principal'>
				<AlertMessage type='INFO' header={header} />
				<input onChange={this.updateInput} placeholder='Project URL' name='PrincipalProjectURL'/>
				<label className='checkboxLabel'>
					<input type="checkbox" onChange={this.onCheckBoxChangePrincipalPrivate}/>Is private
				</label>
				<input id='principalProjectToken' style={{display:"none"}} onChange={this.updateInput} placeholder='Git Token' name='PrincipalProjectToken'/>
				<label className='checkboxLabel'>
					<input type="checkbox" onChange={this.onCheckBoxChangePrincipalManualEndpoints}/>Add endpoints manually
				</label>
				<div id='listManualEndpoints'>
					<button className='addNewEndpoint' onClick={_a => this.addEnpoint()} style={{marginLeft:"20px"}}>Add</button>
					<ul id='listEndpoints'>
						<li>
							<input placeholder='File Name' className='fileName'/>
							<input placeholder='Endpoint Method' className='endpointMethod'/>
						</li>
					</ul>
				</div>
				<button className='theia-button secondary' title='New Analysis' onClick={_a => principalInstance.runprocessNewAnalysis(this.messageService)} style={{display:"block", marginTop:"5px", marginBottom:"5px",}}>New Analysis</button>
				<button className='theia-button secondary' title='Load Last Project Analysis' onClick={_a => principalInstance.runprocessGetMetrics(this.messageService)}>Get Project Analysis</button>
				<button className='theia-button secondary' title='Load Last Enpoint Analysis' onClick={_a => principalInstance.runprocessGetMetricsEndpoint(this.messageService,this.backendService)}>Get Enpoint Analysis</button>
				<div id='waitAnimation' className="lds-dual-ring"></div>
				<div id='TdProjectResults'>
					<p id='TDIndex' style={{marginLeft:'10px', display:'block'}}></p>
					<p id='issuesNumber' style={{marginLeft:'10px', marginBottom:'auto', display:'block'}}></p>
					<div id='issues' style={{marginLeft:'10px'}}></div>
				</div>
				<ul id='endpointResultsList'>
				</ul>
			</div>
			<div id='td-interest'>
				<AlertMessage type='INFO' header={header2} />
				<input onChange={this.updateInput} placeholder='Project URL' name='InterestProjectURL'/>
				<label className='checkboxLabel'>
					<input type="checkbox" onChange={this.onCheckBoxChange}/>Is private (for new analysis)
				</label>
				<input id='interestProjectToken' onChange={this.updateInput} placeholder='Project Token' name='InterestProjectToken'/>
				<button className='theia-button secondary' title='Load Interest till last analysis' onClick={_a => interestInstance.runprocessGetInterest(this.messageService)}>Load Interest</button>
				<button className='theia-button secondary' title='Analyze Interest' onClick={_a => interestInstance.runprocessAnalyzeInterest(this.messageService)}>Analyze Interest</button>
				<p id='TDIndexInterest'></p>
				<div id='interest-buttons' className='ShowHide-buttons'>
					<button id='interest-ShowHideFiles' className='theia-button secondary' title='Hide Files' onClick={_a => interestInstance.runprocessShowFiles()}>Hide Files</button>
					<button id='interest-ShowHideChart' className='theia-button secondary' title='Show Evolution' onClick={_a => interestInstance.runprocessShowEvolution()}>Show Evolution</button>
				</div>
				<div id='chartInterest' className='chart'></div>
				<div id='filesInterest'></div>
			</div>
			<div id='reusability'>
				<AlertMessage type='INFO' header={header3} />
				<input onChange={this.updateInput} placeholder='Project URL' name='ReusabilityProjectURL'/>
				<button className='theia-button secondary' title='Get Reusability Analysis' onClick={_a => reusabilityInstance.runprocessLoadReusability(this.messageService)}>Get Reusability Analysis</button>
				<p id='indexReusability'></p>
				<div id='reusability-buttons' className='ShowHide-buttons'>
					<button id='reusability-ShowHideFiles' className='theia-button secondary' title='Hide Files' onClick={_a => reusabilityInstance.runprocessShowFiles()}>Hide Files</button>
					<button id='reusability-ShowHideChart' className='theia-button secondary' title='Show Evolution' onClick={_a => reusabilityInstance.runprocessShowEvolution()}>Show Evolution</button>
				</div>
				<div id='chartReusability' className='chart'></div>
				<div id='filesReusability'></div>
			</div>
			<div id='security'>
				<AlertMessage type='INFO' header={header4} />
				<input onChange={this.updateInput} placeholder='Project URL' name='SecurityProjectURL'/>
				<select id="select-security-language" style={{marginLeft:'10px'}}>
					<option value="java">Java</option>
					<option value="python">Python</option>
					<option value="javascript">JavaScript</option>
				</select>
				<button className='theia-button secondary' title='Make Vulnerability Assessment' onClick={_a => securityInstance.runprocessVulnerabilityAssessmentSecurity(this.messageService)}>Make Vulnerability Assessment</button>
				<button className='theia-button secondary' title='Make Security Analysis' onClick={_a => securityInstance.runprocessAnalyzeSecurity(this.messageService)}>Make Security Analysis</button>
				<div id='waitAnimationSecurity' className="lds-dual-ring"></div>
				<div id='vulnerabilityAssessment_Endpoint_Security'>
					<p id='indexSecurity'></p>
					<div id='chartSecurity' style={{display:'none', height:'100px', margin:'0 auto'}}></div>
					<div id='resultsSecurity'></div>
				</div>
				<div id='analyze_Endpoint_Security'>
					<div id='metricsSecurity'></div>
					<button id='show-hide-security-issues' className='theia-button secondary' title='show-hide issues' onClick={_a => securityInstance.showhideIssues(this.messageService)} style={{display:'none'}}>Hide Issues</button>
					<div id='listofSecurityIssues'></div>
				</div>
			</div>
		</div>
    }


	protected addEnpoint(): void {
		let listEndpoints = document.getElementById('listEndpoints');
		let listLi = document.createElement("li");
		let liInput1 = document.createElement("input");
		liInput1.className = 'fileName';
		liInput1.placeholder= 'File Name';
		liInput1.style.width= '50%';
		listLi.appendChild(liInput1);
		let removeB = document.createElement('button');
		var removeButtonText = document.createTextNode("-");
		removeB.appendChild(removeButtonText);
		removeB.addEventListener('click', (e:Event) => {
			var temp= (e.target as HTMLElement).parentElement as HTMLElement;
			temp.remove();
		});
		listLi.appendChild(removeB);
		let liInput2 = document.createElement("input");
		liInput2.className = 'endpointMethod';
		liInput2.placeholder= 'Endpoint Method';
		listLi.appendChild(liInput2);
		listEndpoints?.appendChild(listLi);
	}

	//click for menu item
	protected clickMenu(menuItem: string, divId:string): void {
		//change class of items for menu appearance
		document.getElementById('menuPrincipal')!.className='';
		document.getElementById('menuInterest')!.className='';
		document.getElementById('menuReusability')!.className='';
		document.getElementById('menuSecurity')!.className='';
		document.getElementById(menuItem)!.className='active';
		
		//change appearance
		(document.getElementById("td-principal") as HTMLElement).style.display = "none";
		(document.getElementById("td-interest") as HTMLElement).style.display = "none";
		(document.getElementById("reusability") as HTMLElement).style.display = "none";
		(document.getElementById("security") as HTMLElement).style.display = "none";
		(document.getElementById(divId) as HTMLElement).style.display = "block";
	}
	
	//update the state
	updateInput (e: React.ChangeEvent<HTMLInputElement>) {
		const key =e.currentTarget.name as keyof typeof SmartclideTdReusabilityTheiaWidget.state
		SmartclideTdReusabilityTheiaWidget.state[key] = e.currentTarget.value;
    }

	//update the state for checkbox
	onCheckBoxChange(e: React.ChangeEvent<HTMLInputElement>) {
		if(e.target.checked){
			(document.getElementById("interestProjectToken") as HTMLElement).style.display = "block";
			SmartclideTdReusabilityTheiaWidget.state.InterestProjectHasToken= 'yes';
		}
		else{
			(document.getElementById("interestProjectToken") as HTMLElement).style.display = "none";
			SmartclideTdReusabilityTheiaWidget.state.InterestProjectHasToken= 'no';
		}
	 }

	 //update the state for checkbox
	 onCheckBoxChangePrincipalManualEndpoints(e: React.ChangeEvent<HTMLInputElement>) {
		if(e.target.checked){
			(document.getElementById("listManualEndpoints") as HTMLElement).style.display = "block";
		}
		else{
			(document.getElementById("listManualEndpoints") as HTMLElement).style.display = "none";
		}
	 }

	 //update visibility of Token field
	 onCheckBoxChangePrincipalPrivate(e: React.ChangeEvent<HTMLInputElement>) {
		if(e.target.checked){
			(document.getElementById("principalProjectToken") as HTMLElement).style.display = "block";
		}
		else{
			(document.getElementById("principalProjectToken") as HTMLElement).style.display = "none";
		}
	 }



	//create chart Interest
	static createChartInterest():void{
		//var chart= <Chart data={SmartclideTdReusabilityTheiaWidget.stateInterest.data} />;
		//ReactDOM.render(chart, document.getElementById("chartInterest"));
		(document.getElementById('chartInterest') as HTMLElement).style.display = "block";
		// SmartclideTdReusabilityTheiaWidget.stateInterest.data=[];
		// for(var i=0;i<2000;i++){
		// 	SmartclideTdReusabilityTheiaWidget.stateInterest.data.push([i,i]);
		// }
		this.createChart(SmartclideTdReusabilityTheiaWidget.stateInterest.data, "chartInterest", "Interest");
	}

	//create chart Reusability
	static createChartReusability(){
		//var chart= <Chart data={SmartclideTdReusabilityTheiaWidget.stateReusability.data} />;
		//ReactDOM.render(chart, document.getElementById("chartReusability"));
		(document.getElementById('chartReusability') as HTMLElement).style.display = "block";
		this.createChart(SmartclideTdReusabilityTheiaWidget.stateReusability.data, "chartReusability", "Reusability");
	}

	static resizeChart(){
		if((document.getElementById('chartInterest') as HTMLElement).style.display === "block" ||
		   (document.getElementById('chartReusability') as HTMLElement).style.display === "block")
		{
			SmartclideTdReusabilityTheiaWidget.myChart.resize();
		}
	}

	static createChart(data:number[][], id:string, type:string){
		type EChartsOption = echarts.EChartsOption;
		if(SmartclideTdReusabilityTheiaWidget.myChart !== undefined){
			SmartclideTdReusabilityTheiaWidget.myChart.dispose();
		}
		var chartDom = document.getElementById(id)!;
		SmartclideTdReusabilityTheiaWidget.myChart = echarts.init(chartDom);
		var option: EChartsOption;

		option = {
			tooltip: {
				triggerOn: 'none'
			},
			toolbox: {
				left: 'center',
				itemSize: 25,
				top: 0,
				feature: {
				dataZoom: {
					yAxisIndex: 'none'
				},
				restore: {}
				}
			},
			xAxis: {
				type: 'value',
				min: 1,
				axisPointer: {
				snap: true,
				lineStyle: {
					color: '#7581BD',
					width: 2
				},
				label: {
					show: true,
					formatter: function (params) {
					return 'commit: ' + params.value;
					},
					backgroundColor: '#7581BD'
				},
				handle: {
					show: true,
					size: 30,
					color: '#7581BD'
				}
				},
				splitLine: {
				show: false
				}
			},
			yAxis: {
				type: 'value',
				axisTick: {
				inside: true
				},
				splitLine: {
				show: false
				},
				axisLabel: {
				inside: true,
				formatter: '{value}\n'
				},
				z: 10
			},
			grid: {
				top: 50,
				left: 15,
				right: 15,
				height: 280
			},
			dataZoom: [
				{
				type: 'inside',
				throttle: 50
				}
			],
			series: [
				{
					name: type,
					type: 'line',
					smooth: true,
					symbol: 'circle',
					symbolSize: 5,
					sampling: 'average',
					itemStyle: {
						color: '#0770FF'
					},
					stack: 'a',
					areaStyle: {
						color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{
							offset: 0,
							color: 'rgba(58,77,233,0.8)'
						},
						{
							offset: 1,
							color: 'rgba(58,77,233,0.3)'
						}
						])
					},
					data: data
				}
			]
		};

		option && SmartclideTdReusabilityTheiaWidget.myChart.setOption(option);
	}
}
