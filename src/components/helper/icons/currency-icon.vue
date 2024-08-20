<template>
  <div class="currency-icon" v-if="capitalist">
    <img :src="icon" :alt="name" />
  </div>
</template>

<script>
import adv_cash from 'assets/icons/adv_cash.svg'
import adv_cash_3 from 'assets/icons/adv_cash_3.svg'
import adv_cash_b2 from 'assets/icons/adv_cash_b2.svg'
import alfa from 'assets/icons/alfa.svg'
import alfa_cash from 'assets/icons/alfa_cash.svg'
import avangard from 'assets/icons/avangard.svg'
import bank from 'assets/icons/bank.svg'
import bep_20_by from 'assets/icons/bep_20_by.svg'
import bep_20_p from 'assets/icons/bep_20_p.svg'
import bep_20_py from 'assets/icons/bep_20_py.svg'
import bitcoin from 'assets/icons/bitcoin.svg'
import bitcoin_cash from 'assets/icons/bitcoin_cash.svg'
import bnb from 'assets/icons/bnb.svg'
import capitalist from 'assets/icons/capitalist.svg'
import cash from 'assets/icons/cash.svg'
import dash from 'assets/icons/dash.svg'
import dollar from 'assets/icons/dollar.svg'
import erc_20 from 'assets/icons/erc_20.svg'
import erc_20_c from 'assets/icons/erc_20_c.svg'
import etherium from 'assets/icons/etherium.svg'
import euro from 'assets/icons/euro.svg'
import gazprom from 'assets/icons/gazprom.svg'
import home_credit from 'assets/icons/home_credit.svg'
import kukuruza from 'assets/icons/kukuruza.svg'
import litecoin from 'assets/icons/litecoin.svg'
import minobank from 'assets/icons/minobank.svg'
import mir from 'assets/icons/mir.svg'
import monero from 'assets/icons/monero.svg'
import mts from 'assets/icons/mts.svg'
import neobank from 'assets/icons/neobank.svg'
import neteller from 'assets/icons/neteller.svg'
import omni from 'assets/icons/omni.svg'
import open from 'assets/icons/open.svg'
import oshad_gw from 'assets/icons/oshad_gw.svg'
import oshad_gy from 'assets/icons/oshad_gy.svg'
import otp_fg from 'assets/icons/otp_fg.svg'
import otp_g from 'assets/icons/otp_g.svg'
import otp_l from 'assets/icons/otp_l.svg'
import otp_y from 'assets/icons/otp_y.svg'
import ozon from 'assets/icons/ozon.svg'
import paxum from 'assets/icons/paxum.svg'
import payeer from 'assets/icons/payeer.svg'
import payoneer from 'assets/icons/payoneer.svg'
import paypal2 from 'assets/icons/paypal2.svg'
import paypall from 'assets/icons/paypall.svg'
import paysera from 'assets/icons/paysera.svg'
import perfect_money from 'assets/icons/perfect_money.svg'
import pochta_bank from 'assets/icons/pochta_bank.svg'
import polygon from 'assets/icons/polygon.svg'
import privat_l from 'assets/icons/privat_l.svg'
import privat_ld from 'assets/icons/privat_ld.svg'
import psb from 'assets/icons/psb.svg'
import pumb from 'assets/icons/pumb.svg'
import raifaizen from 'assets/icons/raifaizen.svg'
import rnkb from 'assets/icons/rnkb.svg'
import rosbank from 'assets/icons/rosbank.svg'
import rosselhoz from 'assets/icons/rosselhoz.svg'
import rus_standart from 'assets/icons/rus_standart.svg'
import sber from 'assets/icons/sber.svg'
import scrill from 'assets/icons/scrill.svg'
import sense from 'assets/icons/sense.svg'
import sepa from 'assets/icons/sepa.svg'
import sil from 'assets/icons/sil.svg'
import sovkombank from 'assets/icons/sovkombank.svg'
import spb from 'assets/icons/spb.svg'
import system_pay from 'assets/icons/system_pay.svg'
import tether from 'assets/icons/tether.svg'
import tinkoff from 'assets/icons/tinkoff.svg'
import tinkoff_cash from 'assets/icons/tinkoff_cash.svg'
import trc_20 from 'assets/icons/trc_20.svg'
import tron from 'assets/icons/tron.svg'
import trueusd from 'assets/icons/trueusd.svg'
import ukrainian from 'assets/icons/ukrainian.svg'
import ukrsib from 'assets/icons/ukrsib.svg'
import usdc from 'assets/icons/usdc.svg'
import vtb from 'assets/icons/vtb.svg'
import web_money from 'assets/icons/web_money.svg'
import wisa from 'assets/icons/wisa.svg'
import wise from 'assets/icons/wise.svg'
import youmoney from 'assets/icons/youmoney.svg'
import z_cash_yb from 'assets/icons/z_cash_yb.svg'
import z_cash_yw from 'assets/icons/z_cash_yw.svg'
import zcash_ybb from 'assets/icons/zcash_ybb.svg'
import tenge from 'assets/icons/tenge.svg'
import ruble from 'assets/icons/ruble.svg'
import tinkoff_qr from 'assets/icons/tinkoff_qr.svg'

export default {
  name: 'CurrencyIcon',
  props: {
    name: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      adv_cash,
      adv_cash_3,
      adv_cash_b2,
      alfa,
      alfa_cash,
      avangard,
      bank,
      bep_20_by,
      bep_20_p,
      bep_20_py,
      bitcoin,
      bitcoin_cash,
      bnb,
      capitalist,
      cash,
      dash,
      dollar,
      erc_20,
      erc_20_c,
      etherium,
      euro,
      gazprom,
      home_credit,
      kukuruza,
      litecoin,
      minobank,
      mir,
      monero,
      mts,
      neobank,
      neteller,
      omni,
      open,
      oshad_gw,
      oshad_gy,
      otp_fg,
      otp_g,
      otp_l,
      otp_y,
      ozon,
      paxum,
      payeer,
      payoneer,
      paypal2,
      paypall,
      paysera,
      perfect_money,
      pochta_bank,
      polygon,
      privat_l,
      privat_ld,
      psb,
      pumb,
      raifaizen,
      rnkb,
      rosbank,
      rosselhoz,
      rus_standart,
      sber,
      scrill,
      sense,
      sepa,
      sil,
      sovkombank,
      spb,
      system_pay,
      tether,
      tinkoff,
      tinkoff_cash,
      trc_20,
      tron,
      trueusd,
      ukrainian,
      ukrsib,
      usdc,
      vtb,
      web_money,
      wisa,
      wise,
      youmoney,
      z_cash_yb,
      z_cash_yw,
      zcash_ybb,
      tenge,
      ruble,
    }
  },
  computed: {
    icon() {
      switch (this.name) {
        case 'BTC':
          return bitcoin
        case 'ETH':
          return etherium
        case 'USDT':
          return tether
        case 'BNB':
          return bnb
        case 'USDC':
          return usdc
        case 'DOGE':
          return kukuruza
        case 'LTC':
          return litecoin
        case 'TRX':
          return tron
        case 'XMR':
          return monero
        case 'TUSD':
          return trueusd
        case 'ZEC':
          return z_cash_yb
        case 'DASH':
          return dash
        case 'RUB':
          return ruble
        case 'USD':
          return dollar
        case 'EUR':
          return euro
        case 'UAH':
          return ukrainian
        case 'KZT':
          return tenge
        case 'BYN':
          return kukuruza
        case 'TRC 20':
          return trc_20
        case 'ERC 20':
          return erc_20
        case 'BEP 20':
          return bep_20_by
        case 'SOL':
          return kukuruza
        case 'OMNI':
          return omni
        case 'POLYGON':
          return polygon
        case 'Счет ИП или ООО':
          return kukuruza
        case 'РНКБ':
          return rnkb
        case 'Открытие':
          return open
        case 'Почта Банк':
          return pochta_bank
        case 'МТС Банк':
          return mts
        case 'Хоум Кредит':
          return home_credit
        case 'Visa/MasterCard':
          return wisa
        case 'СБП':
          return spb
        case 'Банковский счет"':
          return bank
        case 'Райффайзен':
          return raifaizen
        case 'Наличные':
          return cash
        case 'Тинькоф':
          return tinkoff
        case 'Сбербанк':
          return sber
        case 'ЮMoney':
          return youmoney
        case 'Payeer':
          return payeer
        case 'WebMoney':
          return web_money
        case 'AdvancedCash':
          return adv_cash
        case 'Capitalist':
          return capitalist
        case 'Альфа-Банк':
          return alfa
        case 'Альфа Cash-in':
          return alfa_cash
        case 'QIWI':
          return kukuruza
        case 'Тинькоф Cash-in':
          return tinkoff_cash
        case 'Тинькоф QR':
          return tinkoff_qr
        case 'ВТБ':
          return vtb
        case 'Русский Стандарт':
          return rus_standart
        case 'Авангард':
          return avangard
        case 'Промсвязьбанк':
          return kukuruza
        case 'Газпромбанк':
          return gazprom
        default:
          return kukuruza
      }
    },
  },
}
</script>

<style>
.currency-icon {
  max-width: 24px;
  max-height: 24px;
  @media (max-width: 1200px) {
    width: 22px;
    height: 22px;
  }
  img {
    max-width: 100%;
    max-height: 100%;
    width: 100%;
    height: 100%;
  }
}
</style>
