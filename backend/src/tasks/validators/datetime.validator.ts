import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { DateTime } from 'luxon';

@ValidatorConstraint({ name: 'DateTime', async: false })
export class IsDateTimeConstraint implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    const attempt: DateTime = DateTime.fromISO(text);
    return attempt.isValid;
  }

  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return 'Text ($value) must be a datetime in ISO format!';
  }
}

export function IsDateTime(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsDateTimeConstraint,
    });
  };
}
