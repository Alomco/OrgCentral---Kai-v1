export interface ProfileEditFormIds {
    displayNameId: string;
    personalEmailId: string;
    firstNameId: string;
    lastNameId: string;
    mobileId: string;
    workPhoneId: string;
    homePhoneId: string;
    addressStreetId: string;
    addressCityId: string;
    addressStateId: string;
    postalCodeId: string;
    countryId: string;
    emergencyNameId: string;
    emergencyRelationshipId: string;
    emergencyPhoneId: string;
    emergencyEmailId: string;
    skillsId: string;
    certificationsId: string;
    personalEmailHelpId: string;
    mobileHelpId: string;
    workPhoneHelpId: string;
    homePhoneHelpId: string;
    emergencyPhoneHelpId: string;
    emergencyEmailHelpId: string;
    skillsHelpId: string;
    certificationsHelpId: string;
}

export function buildProfileEditFormIds(resolvedFormId: string): ProfileEditFormIds {
    const displayNameId = `${resolvedFormId}-displayName`;
    const personalEmailId = `${resolvedFormId}-personalEmail`;
    const firstNameId = `${resolvedFormId}-firstName`;
    const lastNameId = `${resolvedFormId}-lastName`;
    const mobileId = `${resolvedFormId}-phoneMobile`;
    const workPhoneId = `${resolvedFormId}-phoneWork`;
    const homePhoneId = `${resolvedFormId}-phoneHome`;
    const addressStreetId = `${resolvedFormId}-addressStreet`;
    const addressCityId = `${resolvedFormId}-addressCity`;
    const addressStateId = `${resolvedFormId}-addressState`;
    const postalCodeId = `${resolvedFormId}-addressPostalCode`;
    const countryId = `${resolvedFormId}-addressCountry`;
    const emergencyNameId = `${resolvedFormId}-emergencyContactName`;
    const emergencyRelationshipId = `${resolvedFormId}-emergencyContactRelationship`;
    const emergencyPhoneId = `${resolvedFormId}-emergencyContactPhone`;
    const emergencyEmailId = `${resolvedFormId}-emergencyContactEmail`;
    const skillsId = `${resolvedFormId}-skills`;
    const certificationsId = `${resolvedFormId}-certifications`;

    return {
        displayNameId,
        personalEmailId,
        firstNameId,
        lastNameId,
        mobileId,
        workPhoneId,
        homePhoneId,
        addressStreetId,
        addressCityId,
        addressStateId,
        postalCodeId,
        countryId,
        emergencyNameId,
        emergencyRelationshipId,
        emergencyPhoneId,
        emergencyEmailId,
        skillsId,
        certificationsId,
        personalEmailHelpId: `${personalEmailId}-help`,
        mobileHelpId: `${mobileId}-help`,
        workPhoneHelpId: `${workPhoneId}-help`,
        homePhoneHelpId: `${homePhoneId}-help`,
        emergencyPhoneHelpId: `${emergencyPhoneId}-help`,
        emergencyEmailHelpId: `${emergencyEmailId}-help`,
        skillsHelpId: `${skillsId}-help`,
        certificationsHelpId: `${certificationsId}-help`,
    };
}
