import {IntentDialog} from 'botbuilder';
import {Holidays} from '../../helpers/holidays';
import {Dialog} from '../dialog';


export class GetHolidays extends Dialog {
    public static Name = 'service.GetHolidays';

    public RegisterDialog(intentDialog:IntentDialog){
        intentDialog.matches(GetHolidays.Name, async (session,args) => {
            let message = await this.GetHolidaysStr();
            // tslint:disable-next-line:max-line-length
            session.send(`Hello <@${session.message.address.user.id}>. It is holidays for all year since this momment.`);
            session.endDialog(message);
        });
    }

    private async GetHolidaysStr():Promise<string>{
        let out = '';
        let holidays = await Holidays.GetHolidays();
        holidays = holidays.sort((a, b) =>{
            if (a.Name > b.Name) {
                return 1;
            }
            if (a.Name < b.Name) {
                return -1;
            }
            return 0;
        });
        holidays.forEach((holiday) => {
            out += `${holiday.Name} -`;
            holiday.Dates.forEach((date) => {
                if(date.from.getDate() === date.to.getDate()
                && date.from.getMonth() === date.to.getMonth()){
                    out += ` ${date.from.getDate()}/${date.from.getMonth()+1},`;
                } else {
                    // tslint:disable-next-line:max-line-length
                    out += ` (${date.from.getDate()}/${date.from.getMonth()+1} - ${date.to.getDate()}/${date.to.getMonth()+1}),`;
                }
            });
            out = out.substring(0, out.length - 1);
            out += '\r\n';
        });

        return out;
    }
}
