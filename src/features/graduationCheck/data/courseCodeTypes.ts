/**
 * 科目番号タグ定義（共通科目等を科目番号プレフィックスで分類する）
 *
 * This file is derived from Mimori256/Graduation-Checker
 * (https://github.com/Mimori256/Graduation-Checker), src/consts/courseCodeTypes.ts.
 * Licensed under the Mozilla Public License, v. 2.0 (MPL-2.0).
 * If a copy of the MPL was not distributed with this file, You can obtain one
 * at https://mozilla.org/MPL/2.0/.
 *
 * codes: このタグに該当する科目番号プレフィックス
 * except: codes に該当しても除外する科目番号プレフィックス
 */

import { appliedCompulsoryCodeTypes } from "./appliedScienceCourses";

export type CourseCodeType = {
  codes: string[];
  except: string[];
};

// 固定KdB 2023〜2026で確認した芸術専門学群の14領域。
const artDomainPrefixes = "ABCDEFGHJKLNPQ".split("").map((letter) => `YB${letter}`);

export const courseCodeTypes: Record<string, CourseCodeType> = {
  ...appliedCompulsoryCodeTypes,
  芸術英語基礎演習: {
    codes: ["YAX3132", "YAX3142", "YAX3152", "YAX3162", "YAX3172", "YAX3182"],
    except: [],
  },
  日本芸術インターンシップ: { codes: ["YBW2933"], except: [] },
  生物資源専門語学I: { codes: ["EC131"], except: [] },
  生物資源専門語学II: { codes: ["EC14"], except: [] },
  芸術卒業研究: {
    codes: artDomainPrefixes.flatMap((prefix) => [`${prefix}9918`, `${prefix}9928`]),
    except: [],
  },
  芸術領域研究I: { codes: artDomainPrefixes.map((prefix) => `${prefix}9017`), except: [] },
  芸術領域研究II: { codes: artDomainPrefixes.map((prefix) => `${prefix}9027`), except: [] },
  芸術領域特別演習I: { codes: artDomainPrefixes.map((prefix) => `${prefix}9037`), except: [] },
  芸術領域特別演習II: { codes: artDomainPrefixes.map((prefix) => `${prefix}9047`), except: [] },
  芸術領域特別演習III: { codes: artDomainPrefixes.map((prefix) => `${prefix}9057`), except: [] },
  総合科目: {
    codes: ["1", "2", "3", "4", "5", "6"],
    except: [],
  },
  フレッシュマンセミナー: {
    codes: ["11"],
    except: [],
  },
  学問への誘い: {
    codes: ["1227", "1228"],
    except: [],
  },
  学士基盤科目: {
    codes: ["12", "14"],
    except: ["1227", "1228"],
  },
  体育: {
    codes: ["2"],
    except: [],
  },
  外国語: {
    codes: ["3"],
    except: [],
  },
  日本語: {
    codes: ["39"],
    except: [],
  },
  英語: {
    codes: ["31"],
    except: ["3190012", "3190022"],
  },
  初修外国語: {
    codes: ["3"],
    except: ["31"],
  },
  情報: {
    codes: ["6"],
    except: [],
  },
  国語: {
    codes: ["5"],
    except: [],
  },
  芸術: {
    codes: ["4"],
    except: [],
  },
  自由科目特設: {
    codes: ["8"],
    except: ["8049911", "8049921", "8149911"],
  },
  教職に関する科目: {
    codes: ["9"],
    except: ["99"],
  },
  博物館に関する科目: {
    codes: ["99"],
    except: [],
  },
  必修英語: {
    codes: ["31H", "31J", "31K", "31L"],
    except: [],
  },
  知識情報演習: {
    codes: ["GE110", "GE111", "GE112"],
    except: [],
  },
  体育専門語学B: {
    codes: ["W14"],
    except: [],
  },
  体育専門語学A: {
    codes: ["W81"],
    except: [],
  },
  体育専門基礎共通演習: {
    codes: ["W816"],
    except: [],
  },
  体育専門英語基礎演習: {
    codes: ["W862", "W863"],
    except: [],
  },
  体育実技H群: {
    codes: ["W98"],
    except: [],
  },
  比較文化第一専門外国語: {
    codes: ["AC52"],
    except: [],
  },
  心理学卒業研究: {
    codes: ["CC21918", "CC21928"],
    except: [],
  },
  心理学類概論: {
    codes: ["CC11211"],
    except: [],
  },
  地球学卒業研究: {
    codes: ["EE519"],
    except: [],
  },
  地球学際研究演習: {
    codes: ["EG711"],
    except: [],
  },
  地球学際卒業研究: {
    codes: ["EG791"],
    except: [],
  },
  情報科学卒業研究A: {
    codes: ["GB19948", "GB19988"],
    except: [],
  },
  情報科学卒業研究B: {
    codes: ["GB19958", "GB19998"],
    except: [],
  },
  情報科学専門語学A: {
    codes: ["GB19091", "GB19111"],
    except: [],
  },
  情報科学専門語学B: {
    codes: ["GB19101", "GB19121"],
    except: [],
  },
  情報メディア卒業研究A: {
    codes: ["GC48708", "GC48808"],
    except: [],
  },
  情報メディア卒業研究B: {
    codes: ["GC48608", "GC48908"],
    except: [],
  },
  情報メディア専門英語A: {
    codes: ["GC42102", "GC42302"],
    except: [],
  },
  情報メディア専門英語B: {
    codes: ["GC42202", "GC42402"],
    except: [],
  },
  知識卒業研究A: {
    codes: ["GE51118", "GE51128"],
    except: [],
  },
  知識卒業研究B: {
    codes: ["GE51218", "GE51228"],
    except: [],
  },
  知識情報演習I: {
    codes: ["GE110"],
    except: [],
  },
  知識情報演習II: {
    codes: ["GE111"],
    except: [],
  },
  知識情報演習III: {
    codes: ["GE112"],
    except: [],
  },
  工学システム卒業研究A: {
    codes: ["FG19208", "FG19228", "FG29948", "FG29968", "FG39948", "FG39968", "FG49948", "FG49968", "FG59948", "FG59968"],
    except: [],
  },
  工学システム卒業研究B: {
    codes: ["FG19218", "FG19238", "FG29958", "FG29978", "FG39958", "FG39978", "FG49958", "FG49978", "FG59958", "FG59978"],
    except: [],
  },
  工学専門英語A: {
    codes: ["FG18102", "FG18112"],
    except: [],
  },
  工学専門英語B: {
    codes: ["FG20222", "FG30222", "FG40222", "FG50222"],
    except: [],
  },
  工学専門英語演習: {
    codes: ["FG20232", "FG30232", "FG40232", "FG50232"],
    except: [],
  },
  知的専門英語B: {
    codes: ["FG20222"],
    except: [],
  },
  知的専門英語演習: {
    codes: ["FG20232"],
    except: [],
  },
  エネメカ専門英語B: {
    codes: ["FG40222"],
    except: [],
  },
  エネメカ専門英語演習: {
    codes: ["FG40232"],
    except: [],
  },
  数学卒業研究: {
    codes: ["FB14908"],
    except: [],
  },
  数学卒業予備研究: {
    codes: ["FB13901"],
    except: [],
  },
  数学外書輪講II: {
    codes: ["FB13501", "FB13511", "FB13521"],
    except: [],
  },
  社会工学卒業研究A: { codes: ["FH11918", "FH11938"], except: [] },
  社会工学卒業研究B: { codes: ["FH11928", "FH11948"], except: [] },
  物理学実験I: { codes: ["FCC2733"], except: [] },
  物理学実験II: { codes: ["FCC3733"], except: [] },
  物理学卒業研究: { codes: ["FCC4808"], except: [] },
  物理学入門: { codes: ["FCC2202"], except: [] },
  物理解析力学: { codes: ["FCC2464"], except: [] },
  化学卒業研究: { codes: ["FE14808"], except: [] },
  化学基礎1: { codes: ["FE11171", "FE11271"], except: [] },
  化学基礎2: { codes: ["FE11181", "FE11281"], except: [] },
  化学基礎3: { codes: ["FE11191", "FE11291"], except: [] },
  化学安全衛生: { codes: ["1414014"], except: [] },
};
