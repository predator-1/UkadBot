import * as axios from 'axios';
import * as csvparser from 'csv-parse';

export class Holidays{

    public static async GetHolidays():Promise<IPplHolidays[]>{
        let csv = await Holidays.GetCsv();
        let prs = await Holidays.CsvParse(csv);
        let dates = Holidays.GetStringDates(prs);
        let out:IPplHolidays[] =[];
        let current = new Date();
        dates.forEach((date)=>{
            let temp:IPplHolidays = {Name:date.Name, Dates:[]};
            date.Dates.forEach((d)=> {
                if(d.from > current){
                    temp.Dates.push(d);
                }
            });
            if(temp.Dates && temp.Dates.length > 0){
                out.push(temp);
            }
        });
        return out;
    }

    private static async GetCsv(){
        let url = process.env.holidayslist;
        let response = await axios.default.get(process.env.holidayslist);
        return response.data;
    }

    private static GetStringDates(csv:string[][]):IPplHolidays[]{
        let out:IPplHolidays[]=[];
        if(csv){
            for(let i=1; i<csv.length; i++){
                let Name:string = csv[i][0];
                if(Name && Name !== ''){
                    let Dates:string[] = [];
                    for(let y=5; y<csv[i].length; y++){
                        if(y%2 !== 0 && csv[i][y] !== ''){
                            Dates.push(csv[i][y]);
                        }
                    }
                    out.push({Name, Dates:Holidays.DateStrToDate(Dates)});
                }
            }
        }
        return out;
    }

    private static CsvParse(input:string):Promise<string[][]>{
        return new Promise((resolve, reject) =>{
            csvparser(input, {}, (err:any, output:any) =>{
                if(err){
                    reject(err);
                    return;
                }
                resolve(output);
            });
        });
    }

    private static DateStrToDate(datesStr:string[]):IDateSpan[]{
        let dates:IDateSpan[] = [];
        // TODO this
        datesStr.forEach((dateStr) => {
            let tempDates:{from:IDateTxt, to:IDateTxt}[] = [];
            let sevDates = dateStr.replace(' ', '').split(',');
            sevDates.forEach((sevDate)=>{
                if(sevDate.includes('-')){
                    let period = sevDate.split('-');
                    let from = this.ToIDateTxt(period[0]);
                    let to = this.ToIDateTxt(period[1]);
                    tempDates.push({to, from});
                } else {
                    let single = this.ToIDateTxt(sevDate);
                    tempDates.push({to:single, from:single});
                }
            });

            dates.push.apply(dates, this.FillDates(tempDates));
        });
        return dates;
    }

    private static ToIDateTxt(sevDate:string):IDateTxt{
        let datetxt:IDateTxt = {date:'', month:'', year:''};
        let separateDate:string[] = [];
        if(sevDate.includes('/')){
            separateDate = sevDate.split('/');
        }
        else{
            separateDate = sevDate.split('.');
        }

        if(separateDate.length > 0){
            datetxt.date = separateDate[0];
        }
        if(separateDate.length > 1){
            datetxt.month = separateDate[1];
        }
        if(separateDate.length > 2){
            datetxt.year = separateDate[2];
        }
        return datetxt;
    }

    private static FillDates(inputs:{from:IDateTxt, to:IDateTxt}[]):IDateSpan[]{
        let out:IDateSpan[] = [];
        inputs.forEach((input) => {
            try{
                if(input.from.month === ''){
                    if(input.to.month !== ''){
                        input.from.month = input.to.month;
                    } else {
                        for(let i=inputs.length-1; i>-1; i--){
                            if(inputs[i].from.month !== ''){
                                input.from.month = inputs[i].from.month;
                                break;
                            }
                            if(inputs[i].to.month !== ''){
                                input.from.month = inputs[i].to.month;
                                break;
                            }
                        }
                    }
                }
                if(input.to.month === ''){
                    if(input.from.month !== ''){
                        input.to.month = input.from.month;
                    } else {
                        for(let i=inputs.length-1; i>-1; i--){
                            if(inputs[i].from.month !== ''){
                                input.to.month = inputs[i].from.month;
                                break;
                            }
                            if(inputs[i].to.month !== ''){
                                input.to.month = inputs[i].to.month;
                                break;
                            }
                        }
                    }
                }
                if(input.from.year === ''){
                    if(input.to.year !== ''){
                        input.from.year = input.to.year;
                    } else {
                        for(let i=inputs.length-1; i>-1; i--){
                            try{
                                if(inputs[i].from.year !== ''){
                                    input.from.year = inputs[i].from.year;
                                    break;
                                }
                                if(inputs[i].to.year !== ''){
                                    input.from.year = inputs[i].to.year;
                                    break;
                                }
                            } catch(er){
                                let ye =er;
                            }

                        }
                    }
                }
                if(input.to.year === ''){
                    if(input.from.year !== ''){
                        input.to.year = input.from.year;
                    } else {
                        for(let i=inputs.length-1; i>-1; i--){
                            if(inputs[i].from.year !== ''){
                                input.to.year = inputs[i].from.year;
                                break;
                            }
                            if(inputs[i].to.year !== ''){
                                input.to.year = inputs[i].to.year;
                                break;
                            }
                        }
                    }
                }
                if(input.from.date !== '' && input.to.date !== ''
                    && input.from.month !== '' && input.to.month !== ''){
                        out.push({from:this.ToIDateSpan(input.from), to:this.ToIDateSpan(input.to)});
                } else {
                    throw new Error('error parse');
                }
            } catch(e){
                let y =e;
            }
        });
        return out;
    }

    private static ToIDateSpan(input:IDateTxt):Date{
        let month:number = Number(input.month) - 1;
        let year:number;
        if(input.year === ''){
            year = 2018;
        } else {
            year = Number(input.year.length === 2 ? `20${input.year}` : input.year);
        }
        return new Date(year, month,  Number(input.date), 0, 0, 0, 0);
    }
}

interface IDateTxt {
    date:string;
    month:string;
    year:string;
}

export interface IPplHolidays{
    Name:string;
    Dates:IDateSpan[];
}

export interface IDateSpan{
    from:Date;
    to:Date;
}

export interface IPplHolidaysTxt{
    Name:string;
    Dates:string[];
}
