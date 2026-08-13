import { describe, expect, it } from 'vitest';
import { summarizeEffectiveCashflow, validateTaskChange } from './connected-modules.module.js';
import { bookingConfirmationPolicy } from './transactions/transactions.module.js';

describe('transaction lifecycle invariants',()=>{
  it('excludes both a reversed original and its reversal from effective cash totals',()=>{
    const summary=summarizeEffectiveCashflow([
      {status:'REVERSED',reversalOfId:null,direction:'IN',amount:500_000,costType:'OTHER',fixedCost:false},
      {status:'POSTED',reversalOfId:'original-id',direction:'OUT',amount:500_000,costType:'OTHER',fixedCost:false},
      {status:'POSTED',reversalOfId:null,direction:'IN',amount:750_000,costType:'OTHER',fixedCost:false},
    ]);
    expect(summary).toMatchObject({income:750_000,expense:0,net:750_000});
  });

  it('allows sequential task completion only at 100 percent',()=>{
    expect(validateTaskChange('TODO',0,'IN_PROGRESS',25)).toEqual({nextStatus:'IN_PROGRESS',nextProgress:25});
    expect(validateTaskChange('IN_PROGRESS',25,'DONE',100)).toEqual({nextStatus:'DONE',nextProgress:100});
  });

  it('rejects illegal or inconsistent task transitions',()=>{
    expect(()=>validateTaskChange('TODO',0,'DONE',100)).toThrow(/tidak diizinkan/);
    expect(()=>validateTaskChange('IN_PROGRESS',50,'DONE',50)).toThrow(/progress 100/i);
    expect(()=>validateTaskChange('DONE',100,'IN_PROGRESS',10)).toThrow(/tidak diizinkan/);
  });

  it('requires verified DP unless an authorized Owner explicitly overrides',()=>{
    expect(bookingConfirmationPolicy(10_000_000,5_000_000,50,false,new Set())).toEqual({requiredDp:5_000_000,usesOverride:false});
    expect(()=>bookingConfirmationPolicy(10_000_000,0,50,false,new Set())).toThrow(/belum mencapai DP/);
    expect(()=>bookingConfirmationPolicy(10_000_000,0,50,true,new Set(['booking.manage']))).toThrow(/booking.confirm.override/);
    expect(bookingConfirmationPolicy(10_000_000,0,50,true,new Set(['booking.confirm.override']))).toEqual({requiredDp:5_000_000,usesOverride:true});
  });
});
